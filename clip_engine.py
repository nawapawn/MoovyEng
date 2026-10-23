#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python Video Downloader, Queue Sequencer & Full-Preview Composite Exporter for Move0nyoung.
Fetches English movie clips from clip.cafe, caches them locally for smooth playback
with full audio, concatenates multiple queued clips in order, and exports the ENTIRE
Preview Canvas (Background + Vocab + Grammar + Examples + 16:9 Movie Clip) in chosen
aspect ratios (9:16 TikTok/Reels/Shorts, 4:5 IG/FB Feed, 1:1 Square, 16:9 YouTube).
"""

import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CACHE_DIR = BASE_DIR / "clips_cache"
EXPORT_DIR = BASE_DIR / "exports"

CACHE_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://clip.cafe/",
}

HEADER_END = True
RATIO_DIMENSIONS = {
    "9:16": (1080, 1920),
    "4:5": (1080, 1350),
    "2:3": (1080, 1620),
    "1:1": (1080, 1080),
    "16:9": (1920, 1080),
    "3:2": (1620, 1080),
}


def has_audio_stream(video_path: str) -> bool:
    try:
        cmd = [
            "ffprobe",
            "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=codec_type",
            "-of", "csv=p=0",
            str(video_path),
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=6)
        return "audio" in (proc.stdout or "").lower()
    except Exception:
        return True


def detect_black_bars_crop(video_path: str) -> str:
    """
    Detect black bars (letterbox/pillarbox) in a video clip using ffmpeg cropdetect
    so we can crop them out and fill the 16:9 movie frame cleanly without black borders.
    """
    try:
        cmd = [
            "ffmpeg",
            "-hide_banner",
            "-i", str(video_path),
            "-vf", "cropdetect=24:2:0",
            "-frames:v", "60",
            "-f", "null",
            "-",
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
        crops = re.findall(r"crop=(\d+:\d+:\d+:\d+)", proc.stderr or "")
        if crops:
            last_crop = crops[-1]
            w, h, x, y = [int(v) for v in last_crop.split(":")]
            if w >= 120 and h >= 80:
                return f"crop={w}:{h}:{x}:{y},"
    except Exception:
        pass
    return ""


def sanitize_slug(slug_or_url: str) -> str:
    raw = slug_or_url.strip()
    if raw.endswith(".mp4"):
        raw = raw.split("/")[-1][:-4]
    clean = re.sub(r"[^a-zA-Z0-9_\-]", "_", raw)
    return clean[:120] or hashlib.md5(slug_or_url.encode("utf-8")).hexdigest()[:16]


def resolve_video_url(slug_or_url: str) -> str:
    if slug_or_url.startswith("http://") or slug_or_url.startswith("https://"):
        return slug_or_url
    clean_slug = slug_or_url.replace("cafe_", "").strip("/")
    return f"https://clip.cafe/videos/{clean_slug}.mp4"


def download_single_clip(slug_or_url: str) -> dict:
    video_url = resolve_video_url(slug_or_url)
    slug = sanitize_slug(slug_or_url)
    raw_path = CACHE_DIR / f"{slug}_raw.mp4"
    target_path = CACHE_DIR / f"{slug}_crop16x9.mp4"

    if target_path.exists() and target_path.stat().st_size > 10_000:
        return {
            "success": True,
            "slug": slug,
            "videoUrl": video_url,
            "localPath": str(target_path),
            "publicUrl": f"/clips_cache/{slug}_crop16x9.mp4",
            "size": target_path.stat().st_size,
            "cached": True,
        }

    if not (raw_path.exists() and raw_path.stat().st_size > 10_000):
        req = urllib.request.Request(video_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()
            if len(data) < 1000:
                raise RuntimeError(f"Downloaded clip is too small ({len(data)} bytes): {video_url}")
            raw_path.write_bytes(data)

    # Remove black bars (letterbox/pillarbox) and normalize to uniform 16:9 (1280x720) with zero black edges
    debar = detect_black_bars_crop(str(raw_path))
    vf_chain = f"{debar}scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(raw_path),
        "-vf", vf_chain,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "copy",
        "-movflags", "+faststart",
        str(target_path),
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=30)
    if proc.returncode != 0 or not target_path.exists() or target_path.stat().st_size < 5000:
        # Fallback to raw if ffmpeg normalization fails
        target_path = raw_path
        pub_url = f"/clips_cache/{slug}_raw.mp4"
    else:
        pub_url = f"/clips_cache/{slug}_crop16x9.mp4"

    return {
        "success": True,
        "slug": slug,
        "videoUrl": video_url,
        "localPath": str(target_path),
        "publicUrl": pub_url,
        "size": target_path.stat().st_size,
        "cached": False,
    }


def make_even(val: int, minimum: int = 2) -> int:
    v = max(minimum, int(round(val)))
    return v if v % 2 == 0 else v - 1


def merge_and_export_clips(
    clips: list,
    ratio: str = "9:16",
    word: str = "vocab",
    fit_mode: str = "pad",
    slide_image: str = "",
    clip_rect: dict = None,
) -> dict:
    if not clips:
        raise ValueError("No clips provided for sequence merge")

    downloaded = []
    for item in clips:
        slug_or_url = item.get("videoUrl") or item.get("slug") or item.get("id", "") if isinstance(item, dict) else str(item)
        info = download_single_clip(slug_or_url)
        downloaded.append(info)

    safe_word = re.sub(r"[^a-zA-Z0-9_\-]", "_", (word or "vocab").strip())[:40] or "vocab"
    safe_ratio = ratio.replace(":", "x")

    slide_hash = hashlib.md5((slide_image[:2048] if slide_image else "no_slide").encode("utf-8")).hexdigest()[:8]
    rect_hash = hashlib.md5(json.dumps(clip_rect or {}, sort_keys=True).encode("utf-8")).hexdigest()[:6]
    key_hash = hashlib.md5(
        json.dumps([d["slug"] for d in downloaded] + [ratio, fit_mode, slide_hash, rect_hash]).encode("utf-8")
    ).hexdigest()[:10]

    out_filename = f"move0nyoung_{safe_word}_{safe_ratio}_{key_hash}.mp4"
    out_path = EXPORT_DIR / out_filename

    if out_path.exists() and out_path.stat().st_size > 20_000:
        return {
            "success": True,
            "outputPath": str(out_path),
            "publicUrl": f"/exports/{out_filename}",
            "filename": out_filename,
            "ratio": ratio,
            "clipCount": len(downloaded),
            "clips": downloaded,
            "cached": True,
        }

    target_w, target_h = RATIO_DIMENSIONS.get(ratio, (1080, 1920))

    # Check if we are exporting the FULL PREVIEW CANVAS (Slide Image + 16:9 Movie Clip inside clip_rect)
    has_slide_bg = False
    bg_img_path = CACHE_DIR / f"slide_bg_{key_hash}.png"
    mask_img_path = CACHE_DIR / f"clip_mask_{key_hash}.png"
    has_clip_mask = False

    if slide_image and "base64," in slide_image:
        try:
            b64_data = slide_image.split("base64,", 1)[1]
            bg_img_path.write_bytes(base64.b64decode(b64_data))
            has_slide_bg = bg_img_path.exists() and bg_img_path.stat().st_size > 1000
        except Exception:
            has_slide_bg = False

    # Compute exact pixel box for the 16:9 Movie Clip inside the Full Preview Canvas
    if has_slide_bg and clip_rect:
        box_w = make_even(float(clip_rect.get("wRatio", 0.85)) * target_w, 64)
        box_h = make_even(float(clip_rect.get("hRatio", 0.25)) * target_h, 64)
        box_x = max(0, min(target_w - box_w, int(round(float(clip_rect.get("xRatio", 0.075)) * target_w))))
        box_y = max(0, min(target_h - box_h, int(round(float(clip_rect.get("yRatio", 0.28)) * target_h))))

        # Create rounded mask matching #movie-clip-box rounded-2xl styling
        try:
            from PIL import Image, ImageDraw
            mask_r = max(16, int(round(box_w * 0.038)))  # ~35px radius at 918px
            mask_img = Image.new("L", (box_w, box_h), 0)
            draw = ImageDraw.Draw(mask_img)
            draw.rounded_rectangle([0, 0, box_w - 1, box_h - 1], radius=mask_r, fill=255)
            mask_img.save(mask_img_path)
            has_clip_mask = mask_img_path.exists() and mask_img_path.stat().st_size > 100
        except Exception:
            has_clip_mask = False

    cmd = ["ffmpeg", "-y"]
    if has_slide_bg:
        cmd.extend(["-loop", "1", "-i", str(bg_img_path)])

    for d in downloaded:
        cmd.extend(["-i", d["localPath"]])

    filter_parts = []
    concat_inputs = []
    vid_offset = 1 if has_slide_bg else 0

    if has_slide_bg and clip_rect:
        # Scale background slide canvas to exact target resolution
        filter_parts.append(
            f"[0:v]scale={target_w}:{target_h},setsar=1,fps=30,format=yuv420p[bg];"
        )

        # Normalize each movie clip to fill the 16:9 movie-clip-box uniformly with zero black bars
        for i in range(len(downloaded)):
            in_idx = i + vid_offset
            local_p = downloaded[i]["localPath"]
            debar_crop = "" if "_crop16x9.mp4" in str(local_p) else detect_black_bars_crop(local_p)
            # Always scale with increase + crop to box_w:box_h so every movie clip fills the frame equally with no black bars
            v_filter = (
                f"[{in_idx}:v]{debar_crop}scale={box_w}:{box_h}:force_original_aspect_ratio=increase,"
                f"crop={box_w}:{box_h},setsar=1,fps=30,format=yuv420p[v{i}];"
            )
            if has_audio_stream(local_p):
                a_filter = f"[{in_idx}:a]aformat=sample_rates=44100:channel_layouts=stereo[a{i}];"
            else:
                a_filter = f"aevalsrc=0:c=stereo:s=44100:d=4[a{i}];"
            filter_parts.append(v_filter + a_filter)
            concat_inputs.append(f"[v{i}][a{i}]")

        n = len(downloaded)
        concat_str = "".join(concat_inputs) + f"concat=n={n}:v=1:a=1[clipv][outa];"
        overlay_str = f"[bg][clipv]overlay={box_x}:{box_y}:shortest=1,format=yuv420p[outv]"
        full_filter = "".join(filter_parts) + concat_str + overlay_str
    else:
        # Fallback if no slide background image was provided
        for i in range(len(downloaded)):
            in_idx = i + vid_offset
            local_p = downloaded[i]["localPath"]
            debar_crop = "" if "_crop16x9.mp4" in str(local_p) else detect_black_bars_crop(local_p)
            v_filter = (
                f"[{in_idx}:v]{debar_crop}scale={target_w}:{target_h}:force_original_aspect_ratio=increase,"
                f"crop={target_w}:{target_h},setsar=1,fps=30,format=yuv420p[v{i}];"
            )
            if has_audio_stream(local_p):
                a_filter = f"[{in_idx}:a]aformat=sample_rates=44100:channel_layouts=stereo[a{i}];"
            else:
                a_filter = f"aevalsrc=0:c=stereo:s=44100:d=4[a{i}];"
            filter_parts.append(v_filter + a_filter)
            concat_inputs.append(f"[v{i}][a{i}]")

        n = len(downloaded)
        concat_str = "".join(concat_inputs) + f"concat=n={n}:v=1:a=1[outv][outa]"
        full_filter = "".join(filter_parts) + concat_str

    cmd.extend([
        "-filter_complex", full_filter,
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "21",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(out_path),
    ])

    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        raise RuntimeError("FFmpeg process timed out after 60s")
    try:
        if bg_img_path.exists():
            bg_img_path.unlink()
        if mask_img_path.exists():
            mask_img_path.unlink()
    except Exception:
        pass

    if proc.returncode != 0:
        raise RuntimeError(f"FFmpeg merge failed: {proc.stderr[-600:]}")

    return {
        "success": True,
        "outputPath": str(out_path),
        "publicUrl": f"/exports/{out_filename}",
        "filename": out_filename,
        "ratio": ratio,
        "clipCount": len(downloaded),
        "clips": downloaded,
        "size": out_path.stat().st_size,
        "cached": False,
    }


def main():
    parser = argparse.ArgumentParser(description="Move0nyoung Python Clip Engine")
    parser.add_argument("--action", choices=["download", "sequence", "export"], required=True)
    parser.add_argument("--slug", help="Single clip slug or video URL")
    parser.add_argument("--payload", help="JSON payload string for sequence/export")
    parser.add_argument("--payload-file", help="Path to JSON payload file for large base64 slide exports")
    args = parser.parse_args()

    try:
        if args.action == "download":
            res = download_single_clip(args.slug or "")
            print(json.dumps(res, ensure_ascii=False))
        else:
            if args.payload_file and Path(args.payload_file).exists():
                data = json.loads(Path(args.payload_file).read_text(encoding="utf-8"))
            else:
                data = json.loads(args.payload or "{}")
            clips = data.get("clips", [])
            ratio = data.get("ratio", "9:16")
            word = data.get("word", "vocab")
            fit_mode = data.get("fitMode", "pad")
            slide_image = data.get("slideImage", "")
            clip_rect = data.get("clipRect", None)

            if args.action == "sequence":
                downloaded = [download_single_clip(
                    c.get("videoUrl") or c.get("slug") or c.get("id", "") if isinstance(c, dict) else str(c)
                ) for c in clips]
                print(json.dumps({
                    "success": True,
                    "count": len(downloaded),
                    "clips": downloaded
                }, ensure_ascii=False))
            elif args.action == "export":
                res = merge_and_export_clips(
                    clips=clips,
                    ratio=ratio,
                    word=word,
                    fit_mode=fit_mode,
                    slide_image=slide_image,
                    clip_rect=clip_rect,
                )
                print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()

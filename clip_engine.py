#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python Video Downloader, Queue Sequencer & Full-Preview Composite Exporter for MoovyEng.
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
import time
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
    "16:9": (1920, 1080),
}


def escape_ffmpeg_drawtext(text: str) -> str:
    if not text:
        return ""
    # 1. Backslash
    s = str(text).replace("\\", "\\\\")
    # 2. Straight single quote / apostrophe:
    # Replace with typographical apostrophe ’ (U+2019) to completely prevent FFmpeg outer '...' syntax collisions
    s = s.replace("'", "’")
    # 3. Colon: escape with \: so FFmpeg filter argument parser does not treat it as an option separator
    s = s.replace(":", "\\:")
    # 4. Percent: in drawtext, % must be \\% so level-1 filter parser leaves \% for drawtext
    s = s.replace("%", "\\\\%")
    return s


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


def prune_cache_except(preserve_slugs: list = None):
    """Keep active clips in CACHE_DIR while safely cleaning older unneeded files."""
    if not preserve_slugs:
        return
    try:
        prefixes = tuple(preserve_slugs)
        for f in CACHE_DIR.iterdir():
            if f.is_file() and not f.name.startswith(prefixes):
                try:
                    f.unlink()
                except Exception:
                    pass
    except Exception:
        pass


def prune_old_exports(keep_filename: str = ""):
    """Safely keep only the current export and clean older exports so disk space never accumulates."""
    try:
        now = time.time()
        files = sorted(EXPORT_DIR.glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
        # Keep at most 2 most recent exports, remove the rest immediately so no disk is wasted
        for f in files[2:]:
            if f.name != keep_filename:
                try:
                    f.unlink()
                except Exception:
                    pass
    except Exception:
        pass


def download_single_clip(slug_or_url: str, preserve_slugs: list = None) -> dict:
    video_url = resolve_video_url(slug_or_url)
    slug = sanitize_slug(slug_or_url)
    raw_path = CACHE_DIR / f"{slug}_raw.mp4"
    target_path = CACHE_DIR / f"{slug}_crop16x9.mp4"

    # Keep active queue clips in cache
    # (Do not prune during download to prevent race condition)

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
        # Prune raw intermediate file to preserve storage
        if raw_path.exists() and raw_path != target_path:
            try:
                raw_path.unlink()
            except Exception:
                pass

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

    # Preserve all active sequence clips in cache
    active_slugs = []
    for item in clips:
        s_or_u = item.get("videoUrl") or item.get("slug") or item.get("id", "") if isinstance(item, dict) else str(item)
        if s_or_u:
            active_slugs.append(sanitize_slug(s_or_u))

    # Download all clips in sequence queue
    downloaded = []
    for item in clips:
        slug_or_url = item.get("videoUrl") or item.get("slug") or item.get("id", "") if isinstance(item, dict) else str(item)
        title = (item.get("title") or item.get("movieTitle") or "") if isinstance(item, dict) else ""
        if slug_or_url:
            info = download_single_clip(slug_or_url, preserve_slugs=active_slugs)
            info["title"] = title
            downloaded.append(info)

    if not downloaded:
        raise ValueError("Could not download clips for export")

    safe_word = re.sub(r"[^a-zA-Z0-9_\-]", "_", (word or "vocab").strip())[:40] or "vocab"
    safe_ratio = ratio.replace(":", "x")

    slide_hash = hashlib.md5((slide_image if slide_image else "no_slide").encode("utf-8")).hexdigest()[:10]
    rect_hash = hashlib.md5(json.dumps(clip_rect or {}, sort_keys=True).encode("utf-8")).hexdigest()[:6]
    key_hash = hashlib.md5(
        json.dumps([(d["slug"], d.get("title", "")) for d in downloaded] + [ratio, fit_mode, slide_hash, rect_hash]).encode("utf-8")
    ).hexdigest()[:10]

    out_filename = f"MoovyEng_{safe_word}_{safe_ratio}_{key_hash}.mp4"
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

    if slide_image and "base64," in slide_image:
        try:
            b64_data = slide_image.split("base64,", 1)[1]
            bg_img_path.write_bytes(base64.b64decode(b64_data))
            has_slide_bg = bg_img_path.exists() and bg_img_path.stat().st_size > 1000
        except Exception:
            has_slide_bg = False

    # Compute exact pixel box for the 16:9 Movie Clip inside the Full Preview Canvas
    if has_slide_bg and clip_rect:
        box_w = make_even(float(clip_rect.get("wRatio", 0.85)) * target_w, 2)
        box_h = make_even(float(clip_rect.get("hRatio", 0.25)) * target_h, 2)
        box_x = make_even(float(clip_rect.get("xRatio", 0.075)) * target_w, 0)
        box_y = make_even(float(clip_rect.get("yRatio", 0.28)) * target_h, 0)

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

        font_file = "C\\:/Windows/Fonts/segoeui.ttf" if Path("C:/Windows/Fonts/segoeui.ttf").exists() else "C\\:/Windows/Fonts/arial.ttf"

        # Normalize each movie clip: zero delay PTS reset, 30fps sync, credit watermark, and 44.1kHz audio
        for i in range(len(downloaded)):
            in_idx = i + vid_offset
            local_p = downloaded[i]["localPath"]
            debar_crop = "" if "_crop16x9.mp4" in str(local_p) else detect_black_bars_crop(local_p)
            clip_title = downloaded[i].get("title", "")
            draw_filter = ""
            if clip_title:
                safe_title = escape_ffmpeg_drawtext(clip_title)
                draw_filter = (
                    f",drawtext=fontfile='{font_file}':text='{safe_title}':"
                    f"fontsize=20:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=6:x=16:y=16"
                )
            v_filter = (
                f"[{in_idx}:v]{debar_crop}scale={box_w}:{box_h}:force_original_aspect_ratio=increase,"
                f"crop={box_w}:{box_h}{draw_filter},setsar=1,fps=30,setpts=PTS-STARTPTS,format=yuv420p[v{i}];"
            )
            if has_audio_stream(local_p):
                a_filter = (
                    f"[{in_idx}:a]aformat=sample_rates=44100:channel_layouts=stereo,"
                    f"aresample=async=1000:min_hard_comp=0.100000:first_pts=0,asetpts=PTS-STARTPTS[a{i}];"
                )
            else:
                a_filter = f"aevalsrc=0:c=stereo:s=44100:d=4,asetpts=PTS-STARTPTS[a{i}];"
            filter_parts.append(v_filter + a_filter)
            concat_inputs.append(f"[v{i}][a{i}]")

        n = len(downloaded)
        concat_str = "".join(concat_inputs) + f"concat=n={n}:v=1:a=1[clipv][outa];"
        overlay_str = f"[bg][clipv]overlay={box_x}:{box_y}:shortest=1,format=yuv420p[outv]"
        full_filter = "".join(filter_parts) + concat_str + overlay_str
    else:
        font_file = "C\\:/Windows/Fonts/segoeui.ttf" if Path("C:/Windows/Fonts/segoeui.ttf").exists() else "C\\:/Windows/Fonts/arial.ttf"

        # Fallback if no slide background image was provided
        for i in range(len(downloaded)):
            in_idx = i + vid_offset
            local_p = downloaded[i]["localPath"]
            debar_crop = "" if "_crop16x9.mp4" in str(local_p) else detect_black_bars_crop(local_p)
            clip_title = downloaded[i].get("title", "")
            draw_filter = ""
            if clip_title:
                safe_title = escape_ffmpeg_drawtext(clip_title)
                draw_filter = (
                    f",drawtext=fontfile='{font_file}':text='{safe_title}':"
                    f"fontsize=22:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=8:x=20:y=20"
                )
            v_filter = (
                f"[{in_idx}:v]{debar_crop}scale={target_w}:{target_h}:force_original_aspect_ratio=increase,"
                f"crop={target_w}:{target_h}{draw_filter},setsar=1,fps=30,setpts=PTS-STARTPTS,format=yuv420p[v{i}];"
            )
            if has_audio_stream(local_p):
                a_filter = (
                    f"[{in_idx}:a]aformat=sample_rates=44100:channel_layouts=stereo,"
                    f"aresample=async=1000:min_hard_comp=0.100000:first_pts=0,asetpts=PTS-STARTPTS[a{i}];"
                )
            else:
                a_filter = f"aevalsrc=0:c=stereo:s=44100:d=4,asetpts=PTS-STARTPTS[a{i}];"
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
        "-shortest",
        "-movflags", "+faststart",
        str(out_path),
    ])

    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=90)
    except subprocess.TimeoutExpired:
        raise RuntimeError("FFmpeg process timed out after 90s")
    try:
        if bg_img_path.exists():
            bg_img_path.unlink()
    except Exception:
        pass

    if proc.returncode != 0:
        err_lines = [line.strip() for line in proc.stderr.splitlines() if any(k in line.lower() for k in ["error", "invalid", "no such", "failed", "cannot"])]
        summary = " | ".join(err_lines[-4:]) if err_lines else proc.stderr[-800:].strip()
        raise RuntimeError(f"FFmpeg merge failed: {summary}")

    # Remove older exports so they do not accumulate on disk
    prune_old_exports(out_filename)

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
    parser = argparse.ArgumentParser(description="MoovyEng Python Clip Engine")
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

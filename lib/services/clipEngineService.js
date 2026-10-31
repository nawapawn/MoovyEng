import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

/**
 * Resolves the real project root directory containing clip_engine.py
 */
export function getProjectRoot() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'clip_engine.py'))) {
    return cwd;
  }
  let curr = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(curr, 'clip_engine.py'))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return cwd;
}

/**
 * Returns list of potential python commands to try in order
 */
export function getPythonCommands() {
  const list = [];
  if (process.platform === 'win32') {
    const userPy = 'C:\\Users\\os\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe';
    if (fs.existsSync(userPy)) {
      list.push(userPy);
    }
    list.push('py', 'python', 'python3');
  } else {
    list.push('python3', 'python');
  }
  return list;
}

/**
 * Executes clip_engine.py via python executable
 */
export function runPythonClipEngine(args) {
  return new Promise((resolve, reject) => {
    const projectRoot = getProjectRoot();
    const pyScript = path.join(projectRoot, 'clip_engine.py');

    if (!fs.existsSync(pyScript)) {
      return reject(new Error(`clip_engine.py not found at: ${pyScript}`));
    }

    const commands = getPythonCommands();

    function tryNext(index) {
      if (index >= commands.length) {
        return reject(new Error('No usable Python executable found on this system'));
      }

      const cmd = commands[index];
      const proc = spawn(cmd, [pyScript, ...args], {
        cwd: projectRoot,
        windowsHide: true
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
      proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

      proc.on('error', () => {
        tryNext(index + 1);
      });

      proc.on('close', (code) => {
        if (code !== 0 && !stdout.trim()) {
          if (index + 1 < commands.length && stderr.includes('not found')) {
            return tryNext(index + 1);
          }
          return reject(new Error(stderr.trim() || `Python exited with code ${code}`));
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(stderr.trim() || stdout.trim() || `Python exited with code ${code}`));
        }
      });
    }

    tryNext(0);
  });
}

export function pruneIntermediateCache(aggressive = false) {
  const projectRoot = getProjectRoot();
  const cacheDir = path.join(projectRoot, 'clips_cache');
  const exportsDir = path.join(projectRoot, 'exports');
  
  let filesDeleted = 0;
  let bytesFreed = 0;

  // 1. Clean clips_cache
  if (fs.existsSync(cacheDir)) {
    try {
      const files = fs.readdirSync(cacheDir);
      for (const f of files) {
        const full = path.join(cacheDir, f);
        // If aggressive, delete ALL files in clips_cache so zero video/cache remains on disk!
        const shouldDelete = aggressive ||
          f.endsWith('_raw.mp4') ||
          f.startsWith('export_payload_') ||
          f.startsWith('slide_bg_') ||
          f.startsWith('clip_mask_') ||
          f.endsWith('.tmp') ||
          f.startsWith('thumb_raw_');
        
        if (shouldDelete) {
          try {
            const sz = fs.statSync(full).size;
            fs.unlinkSync(full);
            filesDeleted++;
            bytesFreed += sz;
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Error during clips_cache prune:', err.message);
    }
  }

  // 2. If aggressive, clean all files in exports/ directory as well
  if (aggressive && fs.existsSync(exportsDir)) {
    try {
      const files = fs.readdirSync(exportsDir);
      for (const f of files) {
        const full = path.join(exportsDir, f);
        try {
          const sz = fs.statSync(full).size;
          fs.unlinkSync(full);
          filesDeleted++;
          bytesFreed += sz;
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Error during exports prune:', err.message);
    }
  }

  return { filesDeleted, bytesFreed };
}

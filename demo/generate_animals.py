"""
批量生成 15 个动物插图（农场/海洋/森林三大主题）
统一风格：儿童插画、扁平矢量、明亮配色、白底居中

用 JSON 解析提取 URL（比逐行字符串匹配更稳）
"""
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# 强制无缓冲输出，方便看进度
sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

SKILL = r"C:\Users\DouXiulu\.agents\skills\agnes-ai-generation-skill\scripts\agnes_api.py"
OUT_DIR = Path(r"C:\Users\DouXiulu\Desktop\AIGC_8.8元引流小课_讲义增强与图文提示版_v4.0\豆懂AI微课\demo\assets\images\animals")
OUT_DIR.mkdir(parents=True, exist_ok=True)

STYLE_PREFIX = ("Children book illustration, simple flat vector style, "
                "bright friendly colors, clean plain white background, "
                "centered composition, cute and approachable, educational, no text, no words")

ANIMALS = [
    ("farm_cat",      "an orange cartoon cat sitting and smiling"),
    ("farm_dog",      "a happy brown cartoon dog wagging its tail, sitting"),
    ("farm_rabbit",   "a white cartoon rabbit with long ears, holding a carrot"),
    ("farm_duck",     "a yellow cartoon duck standing, orange beak"),
    ("farm_pig",      "a pink cartoon pig with round body, smiling"),
    ("ocean_fish",    "a small orange cartoon clownfish swimming, stripes"),
    ("ocean_dolphin", "a blue-gray cartoon dolphin jumping out of water, smiling"),
    ("ocean_whale",   "a big blue cartoon whale spouting water, friendly eyes"),
    ("ocean_crab",    "a red cartoon crab with two claws, walking pose"),
    ("ocean_turtle",  "a green cartoon sea turtle with patterned shell, smiling"),
    ("forest_bird",   "a little blue cartoon bird perched on a branch, singing"),
    ("forest_owl",    "a wise brown cartoon owl with big round eyes, sitting"),
    ("forest_fox",    "an orange cartoon fox with fluffy tail, standing"),
    ("forest_bear",   "a brown cartoon bear sitting, holding a honey pot"),
    ("forest_monkey", "a funny brown cartoon monkey hanging, smiling"),
]


def gen_one(filename_key: str, visual_desc: str) -> bool:
    out_path = OUT_DIR / f"{filename_key}.png"
    if out_path.exists() and out_path.stat().st_size > 50000:
        print(f"[SKIP] {filename_key} already exists ({out_path.stat().st_size} bytes)", flush=True)
        return True

    prompt = f"{visual_desc}, {STYLE_PREFIX}"
    print(f"[GEN ] {filename_key}: {visual_desc}", flush=True)

    for attempt in range(1, 4):
        try:
            r = subprocess.run(
                ["python", SKILL, "image", "--prompt", prompt, "--size", "1024x1024"],
                capture_output=True, text=True, timeout=180, encoding="utf-8"
            )
            out = r.stdout or ""

            # 用 JSON 解析提取 URL
            url = None
            start = out.find('{')
            if start >= 0:
                try:
                    data = json.loads(out[start:])
                    urls = data.get("urls") or []
                    if urls:
                        url = urls[0]
                except json.JSONDecodeError:
                    pass

            # 兜底：正则
            if not url:
                import re
                m = re.search(r'(https?://[^\s"\'\\]+\.png)', out)
                url = m.group(1) if m else None

            if not url:
                err = (r.stderr or "")[:300]
                print(f"  attempt {attempt}: no URL. stderr: {err}", flush=True)
                time.sleep(5)
                continue

            # 下载
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            out_path.write_bytes(data)
            print(f"  [OK] {len(data)} bytes -> {out_path.name}", flush=True)
            return True

        except subprocess.TimeoutExpired:
            print(f"  attempt {attempt}: timeout (180s)", flush=True)
            time.sleep(10)
        except Exception as e:
            print(f"  attempt {attempt}: {type(e).__name__}: {e}", flush=True)
            time.sleep(5)

    print(f"  [FAIL] {filename_key} after 3 attempts", flush=True)
    return False


def main():
    results = {}
    for key, desc in ANIMALS:
        ok = gen_one(key, desc)
        results[key] = "OK" if ok else "FAIL"
        time.sleep(2)  # gentle pacing

    print("\n=== Summary ===", flush=True)
    for k, v in results.items():
        print(f"  {k}: {v}", flush=True)
    fails = [k for k, v in results.items() if v == "FAIL"]
    print(f"\nTotal: {len(results)}, OK: {len(results)-len(fails)}, FAIL: {len(fails)}", flush=True)
    if fails:
        print(f"Failed: {fails}", flush=True)


if __name__ == "__main__":
    main()

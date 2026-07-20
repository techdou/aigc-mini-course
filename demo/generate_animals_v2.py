"""
直接调用 Agnes API 生成动物图（绕开脚本的 120s 超时限制）
- 超时提到 300s
- 每张重试 5 次，指数退避
- 串行 + 充分间隔，避免触发限流
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

# 从环境变量取 key
API_KEY = os.environ.get("AGNES_API_KEY") or os.environ.get("AGNES_API_TOKEN") or os.environ.get("APIHUB_AGNES_API_KEY")
if not API_KEY:
    print("[FATAL] AGNES_API_KEY 未设置", flush=True)
    sys.exit(1)

BASE = "https://apihub.agnes-ai.com"
OUT_DIR = Path(r"C:\Users\DouXiulu\Desktop\AIGC_8.8元引流小课_讲义增强与图文提示版_v4.0\豆懂AI微课\demo\assets\images\animals")
OUT_DIR.mkdir(parents=True, exist_ok=True)

STYLE = ("Children book illustration, simple flat vector style, "
         "bright friendly colors, clean plain white background, "
         "centered composition, cute and approachable, educational, no text, no words")

ANIMALS = [
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


def gen_one(key: str, desc: str, timeout: int = 300, max_attempts: int = 5) -> bool:
    out_path = OUT_DIR / f"{key}.png"
    if out_path.exists() and out_path.stat().st_size > 50000:
        print(f"[SKIP] {key} 已存在", flush=True)
        return True

    prompt = f"{desc}, {STYLE}"
    print(f"[GEN ] {key}", flush=True)

    payload = json.dumps({
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "size": "1024x1024",
        "extra_body": {"response_format": "url"}
    }).encode("utf-8")

    for attempt in range(1, max_attempts + 1):
        try:
            req = urllib.request.Request(
                f"{BASE}/v1/images/generations",
                data=payload,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json",
                    "User-Agent": "animal-gen/1.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            # 提取 URL：兼容多种返回结构
            url = None
            if "data" in data and isinstance(data["data"], list):
                for item in data["data"]:
                    if item.get("url"):
                        url = item["url"]
                        break
                    if item.get("b64_json"):
                        # 直接解码 base64
                        import base64
                        out_path.write_bytes(base64.b64decode(item["b64_json"]))
                        print(f"  [OK b64] {out_path.stat().st_size} bytes -> {key}.png", flush=True)
                        return True
            if not url:
                print(f"  attempt {attempt}: 返回无 URL。结构: {list(data.keys())}", flush=True)
                time.sleep(8 * attempt)
                continue

            # 下载
            dreq = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(dreq, timeout=90) as r:
                img_data = r.read()
            out_path.write_bytes(img_data)
            print(f"  [OK] {len(img_data)} bytes -> {key}.png", flush=True)
            return True

        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", errors="replace")[:200]
            except Exception:
                pass
            print(f"  attempt {attempt}: HTTP {e.code} {body}", flush=True)
            # 5xx 才重试，4xx 直接放弃
            if e.code < 500:
                break
            time.sleep(10 * attempt)
        except Exception as e:
            print(f"  attempt {attempt}: {type(e).__name__}: {str(e)[:150]}", flush=True)
            time.sleep(10 * attempt)

    print(f"  [FAIL] {key} after {max_attempts} attempts", flush=True)
    return False


def main():
    results = {}
    for key, desc in ANIMALS:
        ok = gen_one(key, desc)
        results[key] = "OK" if ok else "FAIL"
        # 充分间隔，避免限流
        time.sleep(5)

    print("\n=== Summary ===", flush=True)
    for k, v in results.items():
        print(f"  {k}: {v}", flush=True)
    fails = [k for k, v in results.items() if v == "FAIL"]
    print(f"\n本轮: {len(results)} 张, OK: {len(results)-len(fails)}, FAIL: {len(fails)}", flush=True)


if __name__ == "__main__":
    main()

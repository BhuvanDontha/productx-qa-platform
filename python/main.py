"""
ProductX Multi-Agent QA Platform — Python CLI
----------------------------------------------
Usage:
    # Run via Vercel (live deployed backend — no local API key needed):
    python main.py --mode vercel

    # Run locally (direct Gemini API calls):
    python main.py --mode local
    python main.py --mode local --records 10

    # Pass API key inline (overrides GEMINI_API_KEY env var):
    python main.py --mode local --key YOUR_API_KEY

Environment:
    GEMINI_API_KEY   Required for --mode local
"""

import argparse
import os
from dotenv import load_dotenv

load_dotenv()


def main():
    parser = argparse.ArgumentParser(
        description="ProductX Multi-Agent QA Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--mode", choices=["local", "vercel"], default="vercel",
        help="'vercel' streams from productx-qa.vercel.app (default); "
             "'local' calls Gemini directly",
    )
    parser.add_argument(
        "--key", help="Gemini API key — only needed for --mode local"
    )
    parser.add_argument(
        "--records", type=int, default=None,
        help="Limit number of records (default: all 60)",
    )
    args = parser.parse_args()

    if args.mode == "vercel":
        import vercel_client
        vercel_client.run(max_records=args.records)
    else:
        import pipeline
        api_key = args.key or os.environ.get("GEMINI_API_KEY", "")
        pipeline.run(api_key=api_key, max_records=args.records)


if __name__ == "__main__":
    main()

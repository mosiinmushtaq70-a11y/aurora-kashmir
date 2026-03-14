from space_weather import get_solar_wind, get_kp_index, get_solar_flares
from predictor import calculate_aurora_probability
from datetime import datetime

def run_pipeline():
    """
    Fetch live data and run aurora prediction for Kashmir
    """
    print(f"\n🛰️  Running Aurora Pipeline — {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print("─" * 50)

    # ── Step 1: Fetch live solar wind ──
    print("📡 Fetching solar wind data...")
    sw_df = get_solar_wind()
    
    if sw_df is None or sw_df.empty:
        print("❌ Could not fetch solar wind data")
        return None
    
    # Get latest reading
    latest_sw = sw_df.iloc[-1]
    bz  = float(latest_sw['bz_gsm'])
    bt  = float(latest_sw['bt'])
    
    print(f"   ✅ Bz: {bz} nT  |  Bt: {bt} nT")

    # ── Step 2: Fetch Kp index ──
    print("📊 Fetching Kp index...")
    kp_df = get_kp_index()
    
    if kp_df is None or kp_df.empty:
        print("❌ Could not fetch Kp index")
        return None
    
    latest_kp = float(kp_df.iloc[-1]['kp'])
    print(f"   ✅ Kp: {latest_kp}")

    # ── Step 3: Fetch solar flares ──
    print("🔥 Fetching solar flares...")
    flares_df = get_solar_flares()
    
    flare_count = 0
    flare_classes = []
    
    if flares_df is not None and not flares_df.empty:
        flare_count = len(flares_df)
        flare_classes = flares_df['classType'].tolist()
        print(f"   ✅ {flare_count} flare(s) detected: {', '.join(flare_classes)}")
    else:
        print("   ✅ No major flares detected")

    # ── Step 4: Run prediction ──
    print("\n🌌 Calculating aurora visibility for Kashmir...")
    result = calculate_aurora_probability(
        kp=latest_kp,
        bz=bz,
        bt=bt
    )

    # ── Step 5: Print full report ──
    print(f"\n{'═'*50}")
    print(f"  AURORA FORECAST — KASHMIR")
    print(f"{'═'*50}")
    print(f"  Score       : {result['score']}/100")
    print(f"  Level       : {result['level']}")
    print(f"  Outlook     : {result['description']}")
    print(f"{'─'*50}")
    print(f"  Live Data   :")
    print(f"    Kp Index  : {latest_kp}")
    print(f"    Bz        : {bz} nT {'(good 👍)' if bz < 0 else '(not ideal 👎)'}")
    print(f"    Bt        : {bt} nT")
    print(f"    Flares    : {flare_count} in last 7 days")
    print(f"{'─'*50}")
    print(f"  📍 What to do:")
    for tip in result['tips']:
        print(f"    • {tip}")
    print(f"{'═'*50}\n")

    return result


if __name__ == "__main__":
    run_pipeline()
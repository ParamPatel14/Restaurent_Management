import requests
import sys

BASE_URL = "http://localhost:8000/api"

def verify_analytics():
    print("Verifying Phase 6 Analytics API...")
    
    try:
        # 1. Summary
        res = requests.get(f"{BASE_URL}/analytics/summary")
        if res.status_code != 200:
            print(f"FAILED: /summary returned {res.status_code} {res.text}")
            return
        summary = res.json()
        print(f"Summary Metrics: {summary}")
        if "total_revenue" not in summary:
             print("FAILED: total_revenue missing in summary")
             return

        # 2. Revenue Chart
        res = requests.get(f"{BASE_URL}/analytics/revenue-chart")
        if res.status_code != 200:
            print(f"FAILED: /revenue-chart returned {res.status_code} {res.text}")
            return
        chart_data = res.json()
        print(f"Revenue Chart Data Points: {len(chart_data)}")

        # 3. Top Items
        res = requests.get(f"{BASE_URL}/analytics/top-items")
        if res.status_code != 200:
            print(f"FAILED: /top-items returned {res.status_code} {res.text}")
            return
        top_items = res.json()
        print(f"Top Items: {top_items}")

        # 4. Order Status
        res = requests.get(f"{BASE_URL}/analytics/order-status")
        if res.status_code != 200:
            print(f"FAILED: /order-status returned {res.status_code} {res.text}")
            return
        status_dist = res.json()
        print(f"Status Distribution: {status_dist}")

        print("SUCCESS: All Analytics Endpoints Verified.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_analytics()

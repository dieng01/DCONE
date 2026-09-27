#!/usr/bin/env python3
"""
MQTT Data Publisher - Publish market data to RESTHeart MQTT Broker

This service simulates real market data and publishes to MQTT topics.
In production, replace with actual data sources (stock APIs, crypto exchanges).

Flow: Data Source → MQTT Publisher → RESTHeart MQTT Broker → MongoDB → Frontend
"""

import paho.mqtt.client as mqtt
import json
import time
import random
import os
from datetime import datetime

# MQTT Broker configuration
MQTT_BROKER = os.getenv('MQTT_BROKER', 'restheart')
MQTT_PORT = int(os.getenv('MQTT_PORT', '1883'))
PUBLISH_INTERVAL = int(os.getenv('PUBLISH_INTERVAL', '2000')) / 1000.0  # Convert to seconds

# Market data configuration
STOCKS = [
    {'topic': '/market/stocks/vn-index', 'base_price': 1250, 'symbol': 'VN-Index'},
    {'topic': '/market/stocks/hnx-index', 'base_price': 230, 'symbol': 'HNX-Index'},
    {'topic': '/market/stocks/vn30', 'base_price': 1180, 'symbol': 'VN30'},
    {'topic': '/market/stocks/upcom', 'base_price': 92, 'symbol': 'UPCOM-Index'},
]

CRYPTOS = [
    {'topic': '/market/crypto/btc', 'base_price': 67500, 'symbol': 'BTC'},
    {'topic': '/market/crypto/eth', 'base_price': 3450, 'symbol': 'ETH'},
    {'topic': '/market/crypto/bnb', 'base_price': 590, 'symbol': 'BNB'},
    {'topic': '/market/crypto/sol', 'base_price': 145, 'symbol': 'SOL'},
]

def on_connect(client, userdata, flags, rc):
    """Callback when connected to MQTT broker"""
    if rc == 0:
        print(f"[MQTT Publisher] Connected to {MQTT_BROKER}:{MQTT_PORT}")
        print(f"[MQTT Publisher] Publishing every {PUBLISH_INTERVAL} seconds")
    else:
        print(f"[MQTT Publisher] Connection failed with code {rc}")

def on_disconnect(client, userdata, rc):
    """Callback when disconnected from MQTT broker"""
    if rc != 0:
        print(f"[MQTT Publisher] Unexpected disconnection. Reconnecting...")

def generate_stock_data(stock):
    """Generate simulated stock market data"""
    change = (random.random() - 0.48) * 5
    price = stock['base_price'] + change + (random.random() - 0.5) * 10
    
    return {
        'symbol': stock['symbol'],
        'price': round(price, 2),
        'change': round(change, 2),
        'changePercent': round((change / stock['base_price']) * 100, 2),
        'volume': random.randint(100000000, 600000000),
        'high': round(price + random.random() * 5, 2),
        'low': round(price - random.random() * 5, 2),
        'timestamp': int(datetime.now().timestamp() * 1000)
    }

def generate_crypto_data(crypto):
    """Generate simulated cryptocurrency data"""
    change_percent = (random.random() - 0.47) * 3
    price = crypto['base_price'] * (1 + change_percent / 100)
    
    return {
        'symbol': crypto['symbol'],
        'price': round(price, 2),
        'change': round(price - crypto['base_price'], 2),
        'changePercent': round(change_percent, 2),
        'volume24h': random.randint(10000000000, 60000000000),
        'marketCap': int(price * random.randint(500000, 1500000)),
        'timestamp': int(datetime.now().timestamp() * 1000)
    }

def main():
    """Main function to run MQTT publisher"""
    print("=" * 60)
    print("MQTT Data Publisher - Market Monitor")
    print("=" * 60)
    print(f"Broker: {MQTT_BROKER}:{MQTT_PORT}")
    print(f"Interval: {PUBLISH_INTERVAL}s")
    print("=" * 60)
    
    # Create MQTT client
    client = mqtt.Client(client_id="market-data-publisher")
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    
    # Connect to broker
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
    except Exception as e:
        print(f"[MQTT Publisher] Failed to connect: {e}")
        print("[MQTT Publisher] Retrying in 5 seconds...")
        time.sleep(5)
        return main()
    
    # Start the loop
    client.loop_start()
    
    try:
        while True:
            # Publish stock data
            for stock in STOCKS:
                data = generate_stock_data(stock)
                payload = json.dumps(data)
                client.publish(stock['topic'], payload, qos=1)
                print(f"[PUBLISH] {stock['topic']} → {data['symbol']}: {data['price']}")
            
            # Publish crypto data
            for crypto in CRYPTOS:
                data = generate_crypto_data(crypto)
                payload = json.dumps(data)
                client.publish(crypto['topic'], payload, qos=1)
                print(f"[PUBLISH] {crypto['topic']} → {data['symbol']}: ${data['price']}")
            
            print("-" * 60)
            time.sleep(PUBLISH_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n[MQTT Publisher] Shutting down...")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()

#!/bin/bash

case "$1" in
  start)
    echo "🚀 Starting NATS server..."
    cd /home/vismay-chovatiya/practice/4_day/sdk-repo
    nats-server -c nats-server.conf > nats.log 2>&1 &
    sleep 2
    if lsof -i :4222 > /dev/null 2>&1; then
      echo "✅ NATS running on:"
      echo "   - Client: localhost:4222"
      echo "   - WebSocket: ws://localhost:8080"
      echo "   - Monitoring: http://localhost:8222"
    else
      echo "❌ Failed to start NATS"
      cat nats.log
    fi
    ;;
  
  stop)
    echo "🛑 Stopping NATS server..."
    pkill -f nats-server
    echo "✅ NATS stopped"
    ;;
  
  status)
    if lsof -i :4222 > /dev/null 2>&1; then
      echo "✅ NATS is running"
      echo "   - Client: localhost:4222"
      echo "   - WebSocket: ws://localhost:8080"
      echo "   - Monitoring: http://localhost:8222"
    else
      echo "❌ NATS is not running"
    fi
    ;;
  
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  
  logs)
    tail -f /home/vismay-chovatiya/practice/4_day/sdk-repo/nats.log
    ;;
  
  *)
    echo "Usage: $0 {start|stop|status|restart|logs}"
    exit 1
    ;;
esac

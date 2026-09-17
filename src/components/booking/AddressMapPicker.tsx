import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { radius } from '../../constants/theme';

type Props = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
};

const buildHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { attributionControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

    function post(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
    }

    marker.on('dragend', function () {
      var pos = marker.getLatLng();
      post(pos.lat, pos.lng);
    });

    map.on('click', function (e) {
      marker.setLatLng(e.latlng);
      post(e.latlng.lat, e.latlng.lng);
    });

    document.addEventListener('message', handleNativeMessage);
    window.addEventListener('message', handleNativeMessage);
    function handleNativeMessage(event) {
      try {
        var data = JSON.parse(event.data);
        if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          var next = [data.latitude, data.longitude];
          marker.setLatLng(next);
          map.setView(next, map.getZoom());
        }
      } catch (e) {}
    }
  </script>
</body>
</html>
`;

export function AddressMapPicker({ latitude, longitude, onLocationChange }: Props) {
  const webRef = useRef<WebView>(null);
  const lastSentRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const html = useRef(buildHtml(latitude, longitude)).current;

  React.useEffect(() => {
    if (lastSentRef.current && lastSentRef.current.latitude === latitude && lastSentRef.current.longitude === longitude) {
      return;
    }
    webRef.current?.postMessage(JSON.stringify({ latitude, longitude }));
  }, [latitude, longitude]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { latitude: number; longitude: number };
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        lastSentRef.current = data;
        onLocationChange(data.latitude, data.longitude);
      }
    } catch {
      // ignore malformed messages
    }
  };

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 240,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  webview: { flex: 1 },
});

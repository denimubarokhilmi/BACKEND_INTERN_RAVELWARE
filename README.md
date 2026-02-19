# ⚡ Energy Monitoring API
**PT Ravelware Technology Indonesia** — Backend Developer Intern Challenge

REST API untuk monitoring energi listrik gedung Ravelware. Data dikumpulkan dari 3 panel listrik (per lantai) melalui protokol MQTT, disimpan ke InfluxDB, dan disajikan via REST API untuk kebutuhan Web Dashboard.

---

## 📋 Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [InfluxDB](https://www.influxdata.com/) (local atau cloud)
- Koneksi internet (untuk MQTT broker publik HiveMQ)

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project:

```env
# Server
PORT_APP=3000

# InfluxDB
URL_INFLUX=http://localhost:8086
TOKEN_INFLUX=your_influxdb_token_here
INFLUX_ORG=your_org_name
INFLUX_BUCKET=your_bucket_name
```

---

## 📦 Instalasi

```bash
npm install
```

---

## 🚀 Cara Menjalankan

Jalankan masing-masing perintah di **terminal terpisah**:

### 1. REST API Server
```bash
npm start
```
> Menjalankan Express server di `http://localhost:3000`

### 2. Subscriber (Penerima Data MQTT → InfluxDB)
```bash
npm run sub
```
> Subscribe ke topik `DATA/PM/deni/#` di HiveMQ, lalu tulis data yang masuk ke InfluxDB secara real-time.

### 3. Simulator Sensor (Publisher MQTT)
```bash
npm run pub
```
> Mensimulasikan pengiriman data dari 3 panel listrik ke MQTT broker setiap **1 menit** sekali.

---

## 📁 Struktur Project

```
├── app.js                              # Entry point Express server
├── index.html                          # Dokumentasi lengkap (buka di browser)
├── router/
│   └── router.js                       # Definisi route API
├── controller/
│   ├── controller.js                   # Re-export semua controller
│   └── energy_controller/
│       └── energy.js                   # Validasi input & handler request
├── service/
│   ├── service.js                      # Re-export semua service
│   └── energy_service/
│       └── energy.js                   # Business logic (kalkulasi energy & cost)
├── database/
│   └── influx.js                       # Koneksi InfluxDB
├── simulate.subs.js                    # MQTT Subscriber → tulis ke InfluxDB
├── simulate.sensor.js                  # MQTT Publisher → simulasi sensor
├── .env                                # Konfigurasi environment (buat manual)
├── helper.js                           # bantuan fungsi
└── package.json
```

---

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di file `docs/index.html`, mencakup:

- **System Architecture** — alur data dari sensor hingga API response
- **ERD** — struktur data InfluxDB
- **API Endpoints** — detail parameter, request, dan semua kemungkinan response
- **Swagger UI** — coba endpoint langsung dari browser
- **note** - jika terkena cors origin saat mencoba endpoint dari swagger, install extensi chrome [cors](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en-US&utm_source=ext_sidebar), lalu aktifkan

**Cara membuka:**
```bash
# Cukup buka file di browser
open index.html
(jika ingin lebih simple, download extension Live Server di vscode, setelah terinstall klik kanan pada file tersebut lalu nanti akan terbuka di browser di tab baru)

```
> Tidak perlu server tambahan, langsung buka file-nya saja.

---

## 🔌 API Endpoint

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard/panel/:panelId` | Ambil data energi panel listrik |

### Panel ID yang valid
- `PANEL_LANTAI_1`
- `PANEL_LANTAI_2`
- `PANEL_LANTAI_3`

### Contoh Request

```bash
# Data hari ini (default)
curl http://localhost:3000/api/dashboard/panel/PANEL_LANTAI_1

# Data bulan Februari 2026
curl http://localhost:3000/api/dashboard/panel/PANEL_LANTAI_1?month=feb&year=2026
```

### Contoh Response
```json
{
  "status": "OK",
  "message": "Success fetch data",
  "data": {
    "pmCode": "PANEL_LANTAI_1",
    "year": 2026,
    "month": 2,
    "date": {
      "last_update": "2026-02-20T10:30:00Z",
      "formatted": "20/2/2026, 17.30.00"
    },
    "statusPanel": "ONLINE",
    "energy": 21.74,
    "cost": 32610,
    "details": [...]
  }
}
```

---

## 💡 Catatan

- **Tarif listrik:** Rp 1.500 / kWh
- **Status OFFLINE:** jika tidak ada data masuk lebih dari 5 menit
- **Field `energy`:** bernilai `0` jika tidak menyertakan query `?month&year`
- **`npm run pub`** (simulasi sensor) dan **`npm run sub`** (subscriber) harus berjalan **bersamaan** agar data mengalir ke InfluxDB

---


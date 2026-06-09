## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Wed Jun 03 2026 15:34:00 GMT+0530 (India Standard Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.23.0|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>Basic|
|**Service Type**<br>None|
|**Service URL**<br>N/A|
|**Module Name**<br>northwind|
|**Application Title**<br>Northwind Management Dashboard|
|**Namespace**<br>com.practice|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.148.1|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>True, see https://www.npmjs.com/package/@sap-ux/eslint-plugin-fiori-tools#rules for the eslint rules.|

## northwind

Realtime Enterprise Order and Product Management Dashboard.

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  To launch the generated application, run the following from the generated application root folder:

```
    npm start
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)

# 🛒 Live Product Inventory Master — SAP UI5

A SAP UI5 application connected to the **Northwind OData v2** service that displays a 
live product inventory table with filtering, dynamic record count, and Excel export.

---

## 📋 Features

| Feature | Description |
|---|---|
| 📦 Product Table | Displays products with Category & Supplier (expanded nav properties) |
| 🔢 Serial Numbers | Auto-generated S.No column based on row position |
| 🔢 Record Count | Live count in table title, updates on filter |
| 📤 Export to Excel | Exports all filtered records (all pages, not just loaded rows) |
| 🔍 Filter Support | Count and export respect active filters |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [UI5 Tooling](https://sap.github.io/ui5-tooling/) installed globally

```bash
npm install -g @ui5/cli
```

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/your-repo-name.git

# Navigate into project
cd your-repo-name

# Install dependencies
npm install
```

### Run Locally

```bash
ui5 serve
```

Open your browser at `http://localhost:8080/index.html`

---

## 📁 Project Structure

```
your-project/
├── webapp/
│   ├── controller/
│   │   └── Main.controller.js   # Table logic, export, count, S.No formatter
│   ├── view/
│   │   └── Main.view.xml        # Table UI with all 7 columns
│   ├── manifest.json            # App descriptor (includes sap.ui.export dep)
│   └── index.html
├── .gitignore
├── ui5.yaml
├── package.json
└── README.md
```

---

## 🔌 OData Service

This app uses the public **Northwind OData v2** service:

```
https://services.odata.org/V2/Northwind/Northwind.svc/
```

**Entity used:** `Products`  
**Expanded nav properties:** `Category`, `Supplier`

---

## 📊 Table Columns

| # | Column | OData Property |
|---|---|---|
| 1 | S.No | Auto-generated (formatter) |
| 2 | Product ID | `ProductID` |
| 3 | Product Name | `ProductName` |
| 4 | Category | `Category/CategoryName` |
| 5 | Supplier | `Supplier/CompanyName (SupplierID)` |
| 6 | Unit Price | `UnitPrice` |
| 7 | Units In Stock | `UnitsInStock` |

---

## 📤 Excel Export Notes

- Uses `sap.ui.export.Spreadsheet` (built-in UI5 library)
- Fetches **all server-side records** matching current filter — not just loaded rows
- S.No column in Excel matches the UI serial numbers
- Supplier column format: `CompanyName ( SupplierID )` — mirrors the UI

To enable export, `manifest.json` must declare the dependency:

```json
"sap.ui5": {
  "dependencies": {
    "libs": {
      "sap.ui.export": {}
    }
  }
}

## 📝 License

MIT

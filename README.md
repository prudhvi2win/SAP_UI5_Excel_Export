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
```

## 🔍 Search & Filter

The toolbar provides **3 independent filter fields** that work together using AND logic —
only records matching all filled conditions are shown.

### Filter Fields

| Field | Filters On | OData Property |
|---|---|---|
| Product Name | Product name (contains) | `ProductName` |
| Category | Category name (contains) | `Category/CategoryName` |
| Supplier | Supplier company name (contains) | `Supplier/CompanyName` |

### Step-by-step Explanation

**1. Read input values**
```javascript
var sProductQuery  = this.byId("idSearchName").getValue();
var sCategoryQuery = this.byId("idCategory").getValue();
var sSupplierQuery = this.byId("idSupplier").getValue();
```
Each field is read independently. Empty fields are simply ignored in the next step.

---

**2. Build filters array conditionally**
```javascript
var aFilters = [];

if (sProductQuery) {
    aFilters.push(new Filter("ProductName", FilterOperator.Contains, sProductQuery));
}
```
- Only non-empty fields contribute a `Filter` object
- `FilterOperator.Contains` → translates to OData `$filter=substringof('query', ProductName)`
- If all 3 fields are empty → `aFilters` stays `[]`

---

**3. Combine filters with AND logic**
```javascript
oBinding.filter(
    new Filter({ filters: aFilters, and: true })
);
```
- `and: true` → ALL conditions must match (not just any one)
- Example: searching `Chai` + `Beverages` returns only products named *Chai* in *Beverages* category
- If `and: false` (OR) → any one match would be enough

---

**4. Clear filters when all fields are empty**
```javascript
} else {
    oBinding.filter([]);  // resets to full unfiltered dataset
}
```
Passing an empty array removes all active filters and restores the full product list.

---

**5. Expanded nav properties in filters**
```javascript
new Filter("Category/CategoryName", FilterOperator.Contains, sCategoryQuery)
new Filter("Supplier/CompanyName",  FilterOperator.Contains, sSupplierQuery)
```
These work because the table binding already declares:
```javascript
parameters: { expand: 'Category, Supplier' }
```
Without `expand`, filtering on `Category/CategoryName` would fail silently.

---
## 📝 License

MIT

<img width="1361" height="635" alt="image" src="https://github.com/user-attachments/assets/f2b01647-c0ef-42f8-b1f5-e164fcd38a3c" />
<img width="559" height="262" alt="image" src="https://github.com/user-attachments/assets/63f3ae48-1360-47d1-87c5-f661d45c14da" />
<img width="1107" height="667" alt="image" src="https://github.com/user-attachments/assets/24bbcad8-a9a8-4a87-b4a4-b0fb6ab2a407" />




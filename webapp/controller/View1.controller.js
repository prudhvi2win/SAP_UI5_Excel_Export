sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/practice/northwind/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox",
    "sap/ui/export/library",
    "sap/ui/export/EdmType",
], (Controller, formatter, Filter, FilterOperator, messageToast,
    Fragment, JSONModel, Spreadsheet, MessageBox, exportLibrary, EdmType) => {
    "use strict";

    return Controller.extend("com.practice.northwind.controller.View1", {
        f: formatter,
        onInit() {
            // Get OData Model 
            var oModel = this.getOwnerComponent().getModel();
            // Get JSON Model
            var productModel = this.getOwnerComponent().getModel("productModel");

            var oTable = this.getView().byId("idProductTable");
            oTable.setBusy(true);

            oModel.read("/Products", {
                urlParameters: {
                    "$expand": "Category,Supplier"
                },
                success: (oData) => {
                    productModel.setData(oData);
                    this.getView().byId("idProductTable").setBusy(false);
                },
                error: (oError) => {
                    this.getView().setBusy(false);
                    sap.m.MessageBox.error(
                        "Failed to load products. Please try again."
                    );
                }
            });
        },
        // Triggered when user clicks "Go" on the FilterBar
        onSearch: function () {
            var sProductQuery = this.byId("idSearchName").getValue();
            var sCategoryQuery = this.byId("idCategory").getValue();
            var aSupplierQuery = this.byId("idSupplier").getSelectedKeys();
            var sDiscontinuedQuery = this.byId("idDiscontinued").getSelectedKey();
            // var oDateQuery = this.byId("idDatePicker").getDateValue();
            var aFilters = [];

            if (sProductQuery) {
                aFilters.push(new Filter("ProductName", FilterOperator.Contains, sProductQuery));
            }

            if (sCategoryQuery) {
                aFilters.push(new Filter("Category/CategoryName", FilterOperator.Contains, sCategoryQuery));
            }

            if (aSupplierQuery && aSupplierQuery.length > 0) {
                var aSupplierFilters = aSupplierQuery.map(function (sSupplier) {
                    return new Filter("Supplier/CompanyName", FilterOperator.EQ, sSupplier);
                });
                aFilters.push(new Filter({
                    filters: aSupplierFilters,
                    and: false
                }));
            }

            if (sDiscontinuedQuery) {
                aFilters.push(new Filter("Discontinued", FilterOperator.EQ, sDiscontinuedQuery === "true"));
            }

            // if (oDateQuery) {
            //     aFilters.push(new Filter("ReleaseDate", FilterOperator.EQ, oDateQuery));
            // }

            var oTable = this.byId("idProductTable");
            var oBinding = oTable.getBinding("items");

            if (aFilters.length > 0) {
                oBinding.filter(
                    new Filter({
                        filters: aFilters,
                        and: true
                    })
                );
            } else {
                oBinding.filter([]);
            }
        },

        // Triggered when a user clicks a row in the table
        onRowSelect: function (oEvent) {
            // var oSelectedItem = oEvent.getParameter("listItem");
            // var oContext = oSelectedItem.getBindingContext();
            // var sProductID = oContext.getProperty("ProductID");
            var oContext = oEvent.getParameter("listItem").getBindingContext("productModel");
            var sProductID = oContext.getProperty("ProductID");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView2", {
                productID: sProductID
            });
        },

        onExportToExcel: function () {
            // Step 1: Extract the SAME data that is currently displayed in the table (respects filters/sorting)
            const oTable = this.byId("idProductTable");
            // Get the SAME binding = same filters/sorters applied in the UI
            const oBinding = oTable.getBinding("items");

            // Step 2: Build the column configuration for the spreadsheet export (including expanded navigation properties)
            const aCols = this._buildColumnConfig();

            // Step 3: Configure and trigger the spreadsheet export
            const oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: "Level"
                },
                dataSource: oBinding,   // uses the SAME binding = same filters/sorters
                fileName: "Product_Inventory.xlsx",
                worker: false           // set true in production for large datasets
            };

            // Build a new spreadsheet with the SAME binding = same filters/sorters applied in the UI
            const oSheet = new Spreadsheet(oSettings);

            // Trigger the export and handle the promise result
            oSheet.build()
                .then(() => MessageToast.show("Export successful!"))
                .catch((sErr) => MessageToast.show("Export failed: " + sErr))
                .finally(() => oSheet.destroy());
        },

        // Helper function to build column configuration for spreadsheet export, including expanded navigation properties
        _buildColumnConfig: function () {
            return [
                {
                    label: "Product ID",
                    property: "ProductID",
                    type: EdmType.Integer,
                    width: 10
                },
                {
                    label: "Product Name",
                    property: "ProductName",
                    type: EdmType.String,
                    width: 25
                },
                {
                    label: "Category",
                    property: "Category/CategoryName",  // expanded nav property
                    type: EdmType.String,
                    width: 20
                },
                {
                    label: "Supplier",
                    // mirrors: {Supplier/CompanyName} ( {Supplier/SupplierID} )
                    property: ["Supplier/CompanyName", "Supplier/SupplierID"],
                    type: EdmType.String,
                    template: "{0} ( {1} )",             // same format as UI
                    width: 30
                },
                {
                    label: "Unit Price",
                    property: "UnitPrice",
                    type: EdmType.Number,
                    scale: 2,
                    width: 15
                },
                {
                    label: "Units In Stock",
                    property: "UnitsInStock",
                    type: EdmType.Number,
                    width: 15
                }
            ];
        },
        onAdd: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView2", {
                productID: "add"
            });
        }
    });
});

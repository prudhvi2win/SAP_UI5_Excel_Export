sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/practice/northwind/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], (Controller, formatter, JSONModel, Fragment, MessageToast, MessageBox, History) => {
    "use strict";

    return Controller.extend("com.practice.northwind.controller.View2", {

        f: formatter,

        // ─────────────────────────────────────────────
        // LIFECYCLE
        // ─────────────────────────────────────────────

        onInit() {
            // View state model: controls which buttons/fields are visible
            // mode: "view" | "edit" | "create"
            var oViewModel = new JSONModel({ mode: "view" });
            this.getView().setModel(oViewModel, "viewModel");

            // Register for route match so we receive the productID parameter
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView2").attachPatternMatched(this._onRouteMatched, this);

            // Load the reusable fragment once and place it in the page content
            this._loadFragment();
        },

        // ─────────────────────────────────────────────
        // ROUTING
        // ─────────────────────────────────────────────

        _onRouteMatched: function (oEvent) {
            var sProductID = oEvent.getParameter("arguments").productID;

            if (sProductID === "add") {
                // CREATE flow: blank draft, switch to create mode
                this._setMode("create");
                this._initBlankDraft();
                this.byId("pageDetail").setTitle("New Product");
            } else {
                // VIEW/EDIT flow: load product data into draft model
                this._setMode("view");
                this._loadProduct(sProductID);
            }
        },

        // ─────────────────────────────────────────────
        // FRAGMENT LOADING (once, reused for all modes)
        // ─────────────────────────────────────────────

        _loadFragment: function () {
            var oView = this.getView();

            if (!this._pFormFragment) {
                this._pFormFragment = Fragment.load({
                    id: oView.getId(),
                    name: "com.practice.northwind.view.fragments.ProductForm",
                    controller: this
                }).then(function (oFragment) {
                    oView.addDependent(oFragment);
                    // Place the fragment into the page's content aggregation
                    oView.byId("pageDetail").addContent(oFragment);
                    return oFragment;
                });
            }

            return this._pFormFragment;
        },

        // ─────────────────────────────────────────────
        // DATA LOADING
        // ─────────────────────────────────────────────

        _loadProduct: function (sProductID) {
            var oView       = this.getView();
            var oODataModel = this.getOwnerComponent().getModel(); // Primary OData model

            // Show page busy while fetching
            oView.setBusy(true);

            oODataModel.read("/Products(" + sProductID + ")", {
                urlParameters: { "$expand": "Category,Supplier" },
                success: function (oData) {
                    oView.setBusy(false);
                    // Store a COPY in the draft model — never mutate OData model directly
                    var oDraftModel = new JSONModel(Object.assign({}, oData));
                    oView.setModel(oDraftModel, "draft");

                    // Also expose OData model as "odata" for the Select dropdowns in the fragment
                    oView.setModel(oODataModel, "odata");

                    oView.byId("pageDetail").setTitle(oData.ProductName);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to load product: " + oError.message);
                }.bind(this)
            });

            // Prefetch Categories and Suppliers for the Select dropdowns
            this._prefetchDropdownData(oODataModel);
        },

        _prefetchDropdownData: function (oODataModel) {
            // Categories and Suppliers are needed by the fragment's Select controls.
            // We read them into the OData model's internal store so binding works.
            // (They are already in the store if user navigated from View1 which loaded Suppliers.)
            oODataModel.read("/Categories");
            oODataModel.read("/Suppliers");
        },

        _initBlankDraft: function () {
            var oODataModel = this.getOwnerComponent().getModel();
            this._prefetchDropdownData(oODataModel);

            var oDraftModel = new JSONModel({
                ProductID:       null,
                ProductName:     "",
                CategoryID:      null,
                SupplierID:      null,
                UnitPrice:       "0.00",
                QuantityPerUnit: "",
                UnitsInStock:    0,
                UnitsOnOrder:    0,
                ReorderLevel:    0,
                Discontinued:    false
            });
            this.getView().setModel(oDraftModel, "draft");
            this.getView().setModel(oODataModel, "odata");
        },

        // ─────────────────────────────────────────────
        // MODE MANAGEMENT
        // ─────────────────────────────────────────────

        _setMode: function (sMode) {
            // sMode: "view" | "edit" | "create"
            this.getView().getModel("viewModel").setProperty("/mode", sMode);
        },

        _currentMode: function () {
            return this.getView().getModel("viewModel").getProperty("/mode");
        },

        // ─────────────────────────────────────────────
        // BUTTON HANDLERS
        // ─────────────────────────────────────────────

        onEdit: function () {
            // Snapshot current draft so Cancel can restore it
            var oCurrentData = this.getView().getModel("draft").getData();
            this._oPreEditSnapshot = Object.assign({}, oCurrentData);
            this._setMode("edit");
        },

        onCancel: function () {
            if (this._currentMode() === "create") {
                // In create mode, cancel = go back to list
                this._navBack();
            } else {
                // In edit mode, cancel = restore snapshot and return to view mode
                if (this._oPreEditSnapshot) {
                    this.getView().getModel("draft").setData(this._oPreEditSnapshot);
                }
                this._setMode("view");
            }
        },

        onSave: function () {
            if (this._currentMode() === "create") {
                this._createProduct();
            } else {
                this._updateProduct();
            }
        },

        onDelete: function () {
            var oDraftData = this.getView().getModel("draft").getData();
            var sName      = oDraftData.ProductName;
            var sID        = oDraftData.ProductID;

            MessageBox.confirm(
                "Are you sure you want to permanently delete \"" + sName + "\"?",
                {
                    title: "Confirm Delete",
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.DELETE) {
                            this._deleteProduct(sID);
                        }
                    }.bind(this)
                }
            );
        },

        onNavBack: function () {
            if (this._currentMode() !== "view") {
                // Warn user about unsaved changes before leaving
                MessageBox.confirm("You have unsaved changes. Leave without saving?", {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._navBack();
                        }
                    }.bind(this)
                });
            } else {
                this._navBack();
            }
        },

        _navBack: function () {
            var oHistory  = History.getInstance();
            var sPrevHash = oHistory.getPreviousHash();

            if (sPrevHash !== undefined) {
                window.history.go(-1);
            } else {
                // Fallback: navigate to the master list
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        },

        // ─────────────────────────────────────────────
        // OData CRUD OPERATIONS
        // ─────────────────────────────────────────────

        _createProduct: function () {
            var oView       = this.getView();
            var oODataModel = this.getOwnerComponent().getModel();
            var oPayload    = Object.assign({}, oView.getModel("draft").getData());

            if (!this._validatePayload(oPayload)) return;

            // Clean types for OData integrity
            oPayload.UnitPrice    = parseFloat(oPayload.UnitPrice).toFixed(4);
            oPayload.UnitsInStock = parseInt(oPayload.UnitsInStock, 10);
            oPayload.UnitsOnOrder = parseInt(oPayload.UnitsOnOrder, 10);
            oPayload.ReorderLevel = parseInt(oPayload.ReorderLevel, 10);

            // Remove navigation properties expanded by a previous read — they break POST
            delete oPayload.Category;
            delete oPayload.Supplier;
            delete oPayload.ProductID; // Let the server assign the key

            oView.setBusy(true);

            oODataModel.create("/Products", oPayload, {
                success: function (oData) {
                    oView.setBusy(false);
                    MessageToast.show("Product \"" + oData.ProductName + "\" created successfully.");

                    // Switch to view mode and reload with server-assigned ID
                    this._setMode("view");
                    oView.byId("pageDetail").setTitle(oData.ProductName);
                    oView.getModel("draft").setData(oData);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Create failed: " + this._parseODataError(oError));
                }.bind(this)
            });
        },

        _updateProduct: function () {
            var oView       = this.getView();
            var oODataModel = this.getOwnerComponent().getModel();
            var oPayload    = Object.assign({}, oView.getModel("draft").getData());

            if (!this._validatePayload(oPayload)) return;

            var sProductID = oPayload.ProductID;
            var sPath      = "/Products(" + sProductID + ")";

            // Clean types
            oPayload.UnitPrice    = parseFloat(oPayload.UnitPrice).toFixed(4);
            oPayload.UnitsInStock = parseInt(oPayload.UnitsInStock, 10);
            oPayload.UnitsOnOrder = parseInt(oPayload.UnitsOnOrder, 10);
            oPayload.ReorderLevel = parseInt(oPayload.ReorderLevel, 10);

            // Remove expanded nav properties — PUT only wants scalar fields
            delete oPayload.Category;
            delete oPayload.Supplier;

            oView.setBusy(true);

            // Use update (MERGE / PATCH) to send only the changed fields
            oODataModel.update(sPath, oPayload, {
                success: function () {
                    oView.setBusy(false);
                    MessageToast.show("Product updated successfully.");
                    this._setMode("view");
                    oView.byId("pageDetail").setTitle(oPayload.ProductName);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Update failed: " + this._parseODataError(oError));
                }.bind(this)
            });
        },

        _deleteProduct: function (sProductID) {
            var oView       = this.getView();
            var oODataModel = this.getOwnerComponent().getModel();
            var sPath       = "/Products(" + sProductID + ")";

            oView.setBusy(true);

            oODataModel.remove(sPath, {
                success: function () {
                    oView.setBusy(false);
                    MessageToast.show("Product deleted.");

                    // Refresh the master list's productModel so the deleted row disappears
                    this._refreshMasterList();
                    this._navBack();
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Delete failed: " + this._parseODataError(oError));
                }.bind(this)
            });
        },

        // ─────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────

        _validatePayload: function (oPayload) {
            if (!oPayload.ProductName || oPayload.ProductName.trim() === "") {
                MessageBox.error("Product Name is required.");
                return false;
            }
            if (isNaN(parseFloat(oPayload.UnitPrice)) || parseFloat(oPayload.UnitPrice) < 0) {
                MessageBox.error("Unit Price must be a valid non-negative number.");
                return false;
            }
            return true;
        },

        _parseODataError: function (oError) {
            // Try to extract a human-readable message from the OData error response
            try {
                var oBody = JSON.parse(oError.responseText);
                return oBody.error.message.value || oError.message;
            } catch (e) {
                return oError.message;
            }
        },

        _refreshMasterList: function () {
            // Re-read the full products list so View1's JSON model stays in sync
            var oODataModel  = this.getOwnerComponent().getModel();
            var oProductModel = this.getOwnerComponent().getModel("productModel");

            oODataModel.read("/Products", {
                urlParameters: { "$expand": "Category,Supplier" },
                success: function (oData) {
                    if (oData && Array.isArray(oData.results)) {
                        oData.results.forEach(function (item, index) {
                            item.SNo = index + 1;
                        });
                    }
                    oProductModel.setData(oData);
                }
            });
        }

    });
});

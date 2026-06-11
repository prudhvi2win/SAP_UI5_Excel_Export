sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter"
], (Controller, formatter, Filter, FilterOperator, History, MessageToast, Fragment, Sorter) => {
    "use strict";

    return Controller.extend("com.practice.northwind.controller.View2", {
        formatter: formatter,
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            // Attach a handler to extract parameters when this screen route matches
            oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sProductID = oEvent.getParameter("arguments").productID;

            if (sProductID === 'add') {
                this.mode = 'create';
                this.getView().unbindElement();
                this.getView().setModel(new sap.ui.model.json.JSONModel({
                    ProductName: "",
                    CustomerName: "",
                    UnitPrice: null,
                    UnitsInStock: null,
                    Discontinued: false
                }), "draft");
            } else {
                this.mode = 'display';
                // Perform explicit Element Binding to look exactly at the chosen entry path and expand Category and Supplier
                this.getView().bindElement({
                    path: "/Products(" + sProductID + ")",
                    parameters: {
                        expand: "Category, Supplier, Order_Details"
                    }
                });
            }
            // this.loadFragment(this.mode);
            if (this.getView().getDomRef()) {
                // View already rendered (subsequent navigations)
                this.loadFragment(this.mode);
            } else {
                // View not yet rendered (first load)
                this.getView().addEventDelegate({
                    onAfterRendering: function () {
                        this.loadFragment(this.mode);
                    }.bind(this)
                });
            }
        },
        loadFragment: function (mode) {
            var oPanel = this.getView().byId("idPanel");
            // ✅ Add this check to catch future issues early
            if (!oPanel) {
                console.error("Panel not found!");
                return;
            }
            oPanel.removeAllContent();
            if (mode === 'create') {
                if (this.createFrag) {
                    oPanel.addContent(this.createFrag);
                    return;
                }

                // load fragment asynchronously and add when ready
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.practice.northwind.view.fragments.CreateProductDialog",
                    controller: this
                }).then(function (oFrag) {
                    this.createFrag = oFrag;
                    this.getView().addDependent(oFrag);
                    oPanel.addContent(oFrag);
                }.bind(this));
            } else {
                if (this.displayFrag) {
                    oPanel.addContent(this.displayFrag);
                    return;
                }

                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.practice.northwind.view.fragments.display",
                    controller: this
                }).then(function (oFrag) {
                    this.displayFrag = oFrag;
                    this.getView().addDependent(oFrag);
                    oPanel.addContent(oFrag);
                }.bind(this));
            }
        },

        // Handles the back button navigation click action
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1", {}, true);
            }
        },
        onCustomerVHRequest: function (oEvent) {
            // Open the customer value help dialog fragment only once
            if (this._oCustomerSelectDialog) {
                this._oCustomerSelectDialog.open();
                return;
            }

            Fragment.load({
                id: this.getView().getId(),
                name: "com.practice.northwind.view.fragments.CustF4Help",
                controller: this
            }).then(function (oCustomerSelectDialog) {
                // Store the dialog instance for reuse and forward the event to the dialog controller
                // this.<var> represents the variable of controller that can be reused in other functions like close
                this._oCustomerSelectDialog = oCustomerSelectDialog;
                this.getView().addDependent(oCustomerSelectDialog);
                oCustomerSelectDialog.open();
            }.bind(this));
        },
        onCustomerF4Close: function (oEvent) {
            if (this._oCustomerSelectDialog) {
                this._oCustomerSelectDialog.close();
            }
        },
        onCustomerSelect: function (oEvent) {
            var sCustomerId = oEvent.getSource().getBindingContext().getProperty("CompanyName");
            this.getView().byId("idCustomerVH").setValue(sCustomerId);
            this._oCustomerSelectDialog.close();
        }
        ,
        onCancel: function () {
            // If creating a new product, discard draft and go back
            if (this.mode === 'create') {
                this.getView().setModel(null, "draft");
            }
            this.onNavBack();
        },

        onSave: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel();
            var that = this;

            if (this.mode === 'create') {
                var oDraft = this.getView().getModel("draft").getData();
                // create new product
                oModel.create("/Products", oDraft, {
                    success: function () {
                        MessageToast.show("Product created");
                        that.onNavBack();
                    },
                    error: function () {
                        MessageToast.show("Failed to create product");
                    }
                });
            }
        }
    });
});
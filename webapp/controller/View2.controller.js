sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], (Controller, formatter, Filter, FilterOperator, History, MessageToast, Fragment) => {
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
            
            // Perform explicit Element Binding to look exactly at the chosen entry path and expand Category and Supplier
            this.getView().bindElement({
                path: "/Products(" + sProductID + ")",
                parameters: {
                    expand: "Category, Supplier, Order_Details"
                }
            });
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
        onCustomerSelect: function(oEvent){
            var sCustomerId = oEvent.getSource().getBindingContext().getProperty("CompanyName");
            this.getView().byId("idCustomerVH").setValue(sCustomerId);
            this._oCustomerSelectDialog.close();
        }
    });
});
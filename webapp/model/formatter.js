sap.ui.define([], function () {
    "use strict";

    return {
        calculateGST: function (sCategoryName) {
            // Determine GST based on category
            switch (sCategoryName) {
                case "Beverages":
                    return "18%";
                case "Condiments":
                    return "12%";
                default:
                    return "0%";
            }
        },

        colorDiscontinued: function (bDiscontinued) {
            // Determine color based on discontinued status: true => red, false => success
            if (bDiscontinued === true || bDiscontinued === "true") {
                return "Error";
            } else {
                return "Success";
            }
        }
    };
});
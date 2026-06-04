/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/practice/northwind/test/integration/AllJourneys"
], function () {
	QUnit.start();
});

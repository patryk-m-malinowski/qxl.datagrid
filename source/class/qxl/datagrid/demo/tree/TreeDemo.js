/* ************************************************************************
 *
 *    Qooxdoo DataGrid
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2022-23 Zenesis Limited, https://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

/**
 * Runs a demo of DataGrid where the data is structured as a tree - the model
 * data is taken from a JSON file which is a dump of the file listings for the
 * Qooxdoo framework project, ie this is implementing a file explorer kind of
 * display.
 *
 * The DataSource is an instance of `qxl.datagrid.source.tree.TreeDataSource`,
 * which uses `qxl.datagrid.demo.tree.TreeDemoNodeInspector` to navigate the
 * heirarchy of files and directories (each of which is represented by an instance
 * of `qxl.datagrid.demo.tree.TreeDemoFileNode`).
 *
 * NodeInspector classes are asynchronous, so while it is true that in this
 * demo the entire directory structure is loaded our of the JSON file, the
 * `qxl.datagrid.source.tree.INodeInspector.getChildrenOf` method is asynchronous
 * and could quite possibly have a server round trip to work through the
 * directory structure one level at a time.
 */
qx.Class.define("qxl.datagrid.demo.tree.TreeDemo", {
  extend: qx.ui.container.Composite,

  construct() {
    super();
    this.setLayout(new qx.ui.layout.VBox());

    let grid = this.getQxObject("grid");
    this.add(grid, { flex: 1 });
  },

  members: {
    /**
     * One time initialisation
     */
    async init() {
      this.getQxObject("dataSource").setRoot(await qxl.datagrid.demo.tree.TreeDemoFileNode.createDummyRoot());
    },

    /**
     * @override
     */
    _createQxObjectImpl(id) {
      switch (id) {
        case "dataSource":
          var inspector = new qxl.datagrid.demo.tree.TreeDemoNodeInspector();
          return new qxl.datagrid.source.tree.TreeDataSource(() => inspector, this.getQxObject("columns"));

        case "columns":
          var columns = new qxl.datagrid.column.Columns();
          columns.add(
            new qxl.datagrid.column.tree.ExpansionColumn().set({
              caption: "Name",
              path: "name",
              minWidth: 160,
              flex: 1
            })
          );
          columns.add(
            new qxl.datagrid.column.FileSizeColumn().set({
              caption: "Size",
              path: "size",
              minWidth: 70
            })
          );
          columns.add(
            new qxl.datagrid.column.TextColumn().set({
              caption: "Permissions",
              path: "permissions",
              minWidth: 100
            })
          );
          columns.add(
            new qxl.datagrid.column.DateColumn().set({
              caption: "Last Modified",
              path: "lastModified",
              minWidth: 240,
              dateFormat: new qx.util.format.DateFormat("dd/MM/yyyy hh:mm")
            })
          );
          return columns;

        case "grid":
          var dataSource = this.getQxObject("dataSource");

          var grid = new qxl.datagrid.DataGrid(this.getQxObject("columns")).set({
            dataSource: dataSource
          });
          grid.addListener("changeSelection", evt => {
            let sel = evt.getData();
            console.log("Selection changed to " + sel.map(model => model.toString().join(",")));
          });
          return grid;
      }
    }
  }
});

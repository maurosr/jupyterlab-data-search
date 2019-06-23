import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer // new
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker // new
} from '@jupyterlab/apputils';

import {
  JSONExt // new
} from '@phosphor/coreutils';

import {
  Widget
} from '@phosphor/widgets';

import {
  NotebookWidgetFactory, NotebookPanel
} from '@jupyterlab/notebook';

import {
  RenderMimeRegistry,
  standardRendererFactories as initialFactories
} from '@jupyterlab/rendermime';

import { CommandRegistry } from '@phosphor/commands';

import '../style/index.css';

/**
 * An Dataset Search Widget.
 */
class DataSearchWidget extends Widget {
  /**
   * Construct a new xkcd widget.
   */
  constructor(app: JupyterLab) {
    super();

    this.app = app;
    this.commands = app.commands;
    this.id = 'data-search-jupyterlab';
    this.title.label = 'Dataset Search';
    this.title.closable = true;
    this.addClass('jp-dataSearchWidget');

    this.datasets = [
      ["World Happiness Report 2019", "https://www.kaggle.com/PromptCloudHQ/world-happiness-report-2019"],
      ["Dataset 2", ""],
      ["Dataset 3", ""]
    ]

    // this.img = document.createElement('img');
    // this.img.className = 'jp-xkcdCartoon';
    // this.node.appendChild(this.img);

    var listContainer = document.createElement('div');
    this.node.appendChild(listContainer);
    var listElement = document.createElement('ul');
    listContainer.appendChild(listElement);

    for (var i = 0; i < this.datasets.length; ++i) {
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = "#";
        link.text = this.datasets[i][0];
        link.addEventListener('click', event => this.load_dataset(""))
        listItem.appendChild(link);
        // listItem.innerHTML = `<a onclick=${this.load_dataset(app, this.datasets[i][1])}>${this.datasets[i][0]}<\a>`;
        listContainer.appendChild(listItem);
    }

    // this.img.insertAdjacentHTML('afterend',
    //   `<div class="jp-xkcdAttribution">
    //     <a href="https://creativecommons.org/licenses/by-nc/2.5/" class="jp-xkcdAttribution" target="_blank">
    //       <img src="https://licensebuttons.net/l/by-nc/2.5/80x15.png" />
    //     </a>
    //   </div>`
    // );
  }

   // Utility function to create a new notebook.
  createNew = (cwd: string, kernelName?: string) => {
     // let model = this.app.serviceManager.contents.newUntitled()
     //  .then(model => {
     //    model.content = "asdas"
     //  });



    return this.commands
      .execute('docmanager:new-untitled', { path: cwd, type: 'notebook' })
      .then(model => {
        this.notebooks.push(model);
        this.app.shell.addToMainArea(model);
        this.app.shell.activateById(model.id);

        console.log("Model: " + model);
        for (var property in model) {
          console.log("prop " + property + ": " + model[property]);
        }
        // for (var subproperty in this.app.shell) {
        //   console.log("subprop: " + subproperty);
        // }

        let doc = this.commands.execute('docmanager:open', {
          path: model.path,
          factory: 'Notebook',
          kernel: { name: kernelName }
        })
        .then(doc => {

          // doc._content._activeCell._input = "1+1";

          console.log("Doc: " + doc);
          for (var property in doc) {
            console.log("prop " + property + ": " + doc[property]);
          }

          // for (var property in doc) {
          //   console.log("Prop: " + property);
          //   for (var subproperty in doc[property]) {
          //     console.log("\tSubProp: " + subproperty);
          //   }
          // }

        });

        return doc;
      });
  };

  load_dataset(dataset: string) {
    console.log("load_dataset");
    this.createNew(".", "New Kernel");
  }

  readonly app: JupyterLab;
  readonly commands: CommandRegistry;

  /**
   * The image element associated with the widget.
   */
  // readonly img: HTMLImageElement;
  readonly datasets: ReadonlyArray<[string, string]>;

  readonly rendermime: RenderMimeRegistry = new RenderMimeRegistry({
    initialFactories: initialFactories,
    // latexTypesetter: new MathJaxTypesetter({
    //   url: PageConfig.getOption('mathjaxUrl'),
    //   config: PageConfig.getOption('mathjaxConfig')
    // })
  });

  readonly wFactory: NotebookWidgetFactory = new NotebookWidgetFactory({
    name: 'Notebook',
    modelName: 'notebook',
    fileTypes: ['notebook'],
    defaultFor: ['notebook'],
    preferKernel: true,
    canStartKernel: true,
    rendermime: this.rendermime,
    contentFactory: NotebookPanel.defaultContentFactory,
    mimeTypeService: undefined
  });

  notebooks: Array<NotebookPanel> = new Array();

  /**
   * Handle update requests for the widget.
   */
  // onUpdateRequest(msg: Message): void {
  //   fetch('https://egszlpbmle.execute-api.us-east-1.amazonaws.com/prod').then(response => {
  //     return response.json();
  //   }).then(data => {
  //     this.img.src = data.img;
  //     this.img.alt = data.title;
  //     this.img.title = data.alt;
  //   });
  // }
};

/**
 * Activate the data search widget extension.
 */
function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log('JupyterLab extension jupyterlab_data_search is activated!');

  // Declare a widget variable
  let widget: DataSearchWidget;

  // Add an application command
  const command: string = 'data_search:open';
  app.commands.addCommand(command, {
    label: 'Search Datasets',
    execute: () => {
      if (!widget) {
        // Create a new widget if one does not exist
        widget = new DataSearchWidget(app);
        widget.update();
      }
      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.addToMainArea(widget);
      } else {
        // Refresh the comic in the widget
        widget.update();
      }
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Search' });

  // Track and restore the widget state
  let tracker = new InstanceTracker<Widget>({ namespace: 'data_search' });
  restorer.restore(tracker, {
    command,
    args: () => JSONExt.emptyObject,
    name: () => 'data_search'
  });
};

/**
 * Initialization data for the jupyterlab-data-search extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_data_search',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};


export default extension;

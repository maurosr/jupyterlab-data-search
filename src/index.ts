import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the jupyterlab-data-search extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-data-search',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension jupyterlab-data-search is activated!');
  }
};

export default extension;

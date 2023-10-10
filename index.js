/**
 * @format
 */

import {AppRegistry, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Text.defaultProps = Text.defaultProps || {};
// Text.defaultProps.style = {color: 'red'};

AppRegistry.registerComponent(appName, () => App);

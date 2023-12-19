import 'react-native-gesture-handler'
import React, {Component} from 'react';
import {
  LogBox,
  View,
  BackHandler,
  ToastAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {createStore} from 'redux';
import {Provider} from 'react-redux';   
import { accent, primary } from './src/utilities/colors';
import rootReducer from './src/reducers';
import { fetchLocalStorage } from './src/storage/db';
import Main from './src/screens/Main';

const store = createStore(rootReducer);

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: primary,
    accent: accent,
  },
};

export default class App extends Component {
  state = {
    user: null,
    token: null,
    shouldProceed: false,
    clicks: 0,
  };

  componentDidMount() {
    this.checkIfLogged();
    if (Platform.OS === 'android') {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.backHandlerToast,
      );
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.backHandler.remove();
    }
  }

  backHandlerToast = () => {
    if (this.state.clicks === 1) {
      BackHandler.exitApp();
      return true;
    } else {
      setTimeout(() => {
        this.state.clicks = 0;
      }, 3000);
      this.state.clicks++;
      ToastAndroid.showWithGravityAndOffset(
        'Press again to exit the app.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        10,
        50,
      );
      return true;
    }
  };

  checkUpdates = () => {};

  checkIfLogged = () => {
    fetchLocalStorage('user').then((user) => {
      fetchLocalStorage('token').then((token) => {
        this.setState({
          user: user,
          token: token,
          shouldProceed: true,
        });
      });
    });
  };

  render() {
    LogBox.ignoreAllLogs(true);
    return (
      <Provider store={store}>
        <PaperProvider theme={theme}>
          {!this.state.shouldProceed && (
            <View style={styles.sectionContainer}>
              <ActivityIndicator style={styles.center} />
            </View>
          )}
          {this.state.shouldProceed && (
            <Main user={this.state.user} token={this.state.token} />
          )}
        </PaperProvider>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {justifyContent: 'center', flex: 1},
  center: {alignSelf: 'center'},
});

import React from 'react';
import moment from 'moment';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux'; 
import {TextInput, Snackbar, Button} from 'react-native-paper'; 
const arms = require('../../../assets/arms.png');


import allActions from '../../actions'; 
import Container from '../../ui/components/component';
import {moderateScale} from 'react-native-size-matters';
import {primary, accent} from '../../utilities/colors';
import {withNetwork, post_call} from '../../services/network';
import {storeLocalStorage} from '../../storage/db';

const theme = {
  colors: {primary: accent, underlineColor: 'transparent'},
};

class Login extends React.Component {
  state = {
    username: null,
    password: null,
    loading: false,
    showPass: false,
    showSnack: false,
    message: '',
  };

  redirect(route) {
    this.props.navigation.navigate(route, {is_guest: false});
  }

  setShowPass = () => {
    this.setState({showPass: !this.state.showPass});
  };

  closeSnackBar = () => {
    this.setState({showSnack: !this.state.showSnack});
  };

  login = () => {
    if (!this.state.username) {
      this.setState({message: 'Username is required', showSnack: true});
      return;
    }
    if (!this.state.password) {
      this.setState({message: 'Password is required', showSnack: true});
      return;
    }
    Keyboard.dismiss();
    this.setState({loading: true});
    withNetwork(
      () => {
        let input = {
          User: {
            username: this.state.username,
            password: this.state.password,
          },
        };
        post_call('users/login', null, input)
          .then((response) => {
            this.setState(
              {username: null, password: null, loading: false},
              () => {
                if (response.data) {
                  const user = response.data.user;
                  const token = response.data.token;
                  this.props.setToken(token);
                  this.props.setUser(user);
                  storeLocalStorage(
                    'loginTime',
                    moment().format('YYYY-MM-DD HH:mm'),
                  );
                  storeLocalStorage('token', token).then(() => {
                    storeLocalStorage('user', user).then(() => {
                      this.redirect('Dashboard');
                    });
                  });
                }
              },
            );
          })
          .catch((error) => {
            if (error.response.status === 401) {
              this.setState({
                message: error.response.data.message,
                loading: false,
                showSnack: true,
              });
            }
          });
      },
      () => {
        this.setState({loading: false});
      },
    );
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <View style={styles.main}>
          <View style={styles.viewImage}>
            <Image
              style={styles.imageArms}
              source={arms}
              resizeMode="contain"
            />

            <Text style={styles.titleText}>PvERS</Text>
          </View>
          <View style={styles.viewInfo}>
            <Text style={styles.subTitleText}>Login</Text>
            <View style={styles.viewLine} />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
              style={styles.viewInput}>
              <View>
                <TextInput
                  theme={theme}
                  mode="outlined"
                  label="Username"
                  placeholder="Username"
                  value={this.state.username}
                  onChangeText={(username) => this.setState({username})}
                />

                <TextInput
                  theme={theme}
                  mode="outlined"
                  label="Password"
                  secureTextEntry={!this.state.showPass}
                  onChangeText={(password) => this.setState({password})}
                  right={
                    <TextInput.Icon
                      name={this.state.showPass ? 'eye' : 'eye-off'}
                      onPress={() => {
                        this.setShowPass();
                      }}
                    />
                  }
                />
                <View style={styles.viewButtons}>
                  <Button
                    mode="contained"
                    style={styles.button}
                    loading={this.state.loading}
                    onPress={() => {
                      this.login();
                    }}>
                    Login
                  </Button>
                  <Text style={styles.textRegisterMsg}>
                    Don't have an account?{' '}
                    <Text
                      style={styles.textRegister}
                      onPress={() => {
                        this.props.navigation.navigate('Register');
                      }}>
                      Register
                    </Text>
                  </Text>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View> 
        <Snackbar
          duration={5000}
          visible={this.state.showSnack}
          onDismiss={this.closeSnackBar}
          action={{
            label: 'OK',
          }}>
          {this.state.message}
        </Snackbar>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewImage: {
    height: moderateScale(200),
    backgroundColor: primary,
  },
  imageArms: {
    height: moderateScale(100),
    marginTop: moderateScale(50),
  },
  viewInfo: {
    width: '100%',
    marginTop: moderateScale(-30),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopStartRadius: moderateScale(30),
  },
  titleText: {
    color: 'grey',
    fontSize: moderateScale(35),
    fontWeight: 'bold',
    marginTop: moderateScale(25),
  },
  subTitleText: {
    width: '80%',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: moderateScale(35),
    marginTop: moderateScale(15),
    marginLeft: moderateScale(10),
  },
  viewLine: {
    width: '80%',
    marginHorizontal: '20%',
    height: moderateScale(2),
    backgroundColor: 'grey',
    marginTop: moderateScale(10),
    marginBottom: moderateScale(20),
  },
  viewInput: {
    width: '80%',
    marginHorizontal: '20%',
    flexDirection: 'column',
    marginTop: moderateScale(15),
  },
  viewButtons: {
    width: '90%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: moderateScale(25),
    marginBottom: moderateScale(90),
  },
  button: {
    width: moderateScale(125),
    height: moderateScale(50),
    justifyContent: 'center',
    marginBottom: moderateScale(15),
  },
  textRegisterMsg: {
    fontSize: moderateScale(14),
  },
  textRegister: {
    fontSize: moderateScale(16),
    textDecorationLine: 'underline',
    color: accent,
  },
  afyamoja: {
    height: moderateScale(25),
    marginBottom: moderateScale(15),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.currentUser,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setToken: allActions.userActions.setToken,
      setUser: allActions.userActions.setUser,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

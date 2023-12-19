import React from 'react';
import {connect} from 'react-redux';
import {
  Alert,
  Keyboard,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  View,
} from 'react-native';
import {TextInput, Snackbar, Button} from 'react-native-paper';
import {moderateScale} from 'react-native-size-matters';

import Header from '../../ui/header';
import Container from '../../ui/components/component';
import {accent, green} from '../../utilities/colors';
import {withNetwork, post_call} from '../../services/network';

const theme = {
  colors: {primary: accent, underlineColor: 'transparent'},
};

class Password extends React.Component {
  state = {
    message: '',
    old_password: '',
    password: '',
    confirm_password: '',
    isVisible: false,
    showPassOld: false,
    showPass: false,
    showPassConf: false,
  };

  setShowHide = (field) => {
    this.setState({[field]: !this.state[field]});
  };

  closeSnackBar = () => {
    this.setShowHide('isVisible');
  };

  validateRegister() {
    Keyboard.dismiss();
    if (
      !this.state.old_password ||
      !this.state.password ||
      !this.state.confirm_password
    ) {
      this.setState({message: 'All fields are required', isVisible: true});
      return;
    }
    if (this.state.password !== this.state.confirm_password) {
      this.setState({message: "New Passwords don't match", isVisible: true});
      return;
    }

    this.submitPassword();
  }

  submitPassword = () => {
    this.setState({loading: true});
    withNetwork(
      () => {
        let url = 'users/changePassword';
        let password = {
          User: {
            old_password: this.state.old_password,
            password: this.state.password,
            confirm_password: this.state.confirm_password,
          },
        };

        post_call(url, this.props.authToken, password).then((response) => {
          if (response.data.status === 'success') {
            this.setState({loading: false}, () => {
              Alert.alert('Password Updated', response.data.message);
              this.goBack();
            });
          } else {
            this.setState({loading: false});
            Alert.alert('Password Error', response.data.message);
          }
        });
      },
      () => {
        this.setState({loading: false});
        Alert.alert(' Error', 'There was an error submitting your profile');
      },
    );
  };

  goBack = () => {
    this.props.navigation.navigate('Dashboard');
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header title="Change Password" goBack={this.goBack} />
        <KeyboardAvoidingView
          keyboardVerticalOffset={moderateScale(-150)}
          behavior={'padding'}
          style={styles.viewOuter}>
          <View style={styles.viewContainer}>
            <TextInput
              theme={theme}
              mode="outlined"
              label="Current Password *"
              secureTextEntry={!this.state.showPassOld}
              onChangeText={(text) => this.setState({old_password: text})}
              right={
                <TextInput.Icon
                  name={this.state.showPassOld ? 'eye' : 'eye-off'}
                  onPress={() => {
                    this.setShowHide('showPassOld');
                  }}
                />
              }
            />
            <View style={{marginBottom: moderateScale(30)}} />
            <TextInput
              theme={theme}
              mode="outlined"
              label="New Password *"
              secureTextEntry={!this.state.showPass}
              onChangeText={(text) => this.setState({password: text})}
              right={
                <TextInput.Icon
                  name={this.state.showPass ? 'eye' : 'eye-off'}
                  onPress={() => {
                    this.setShowHide('showPass');
                  }}
                />
              }
            />
            <TextInput
              theme={theme}
              mode="outlined"
              label="Confirm Password *"
              secureTextEntry={!this.state.showPassConf}
              onChangeText={(text) => this.setState({confirm_password: text})}
              right={
                <TextInput.Icon
                  name={this.state.showPassConf ? 'eye' : 'eye-off'}
                  onPress={() => {
                    this.setShowHide('showPassConf');
                  }}
                />
              }
            />

            <Button
              mode="contained"
              style={styles.button}
              labelStyle={styles.textButton}
              onPress={() => this.validateRegister()}>
              Update
            </Button>
          </View>
        </KeyboardAvoidingView>
        <Snackbar
          duration={5000}
          visible={this.state.isVisible}
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
  viewOuter: {
    flex: 1,
  },
  viewContainer: {
    marginTop: moderateScale(20),
    marginLeft: moderateScale(30),
    marginRight: moderateScale(30),
  },
  button: {
    marginTop: moderateScale(15),
    width: moderateScale(150),
    justifyContent: 'center',
    backgroundColor: green,
    alignSelf: 'center',
  },
  textInput: {
    width: '65%',
  },
  textButton: {
    color: 'white',
  },
});

const mapStateToProps = (state) => {
  return {
    authToken: state.currentUser?.token,
  };
};

export default connect(mapStateToProps)(Password);

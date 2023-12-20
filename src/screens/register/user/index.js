import React from 'react';
import {
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import {TextInput, Snackbar, Button} from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import {moderateScale} from 'react-native-size-matters';

import CountryPicker from 'react-native-country-picker-modal';
import Container from '../../../ui/components/container';
import Icon from '../../../ui/components/icon';
import {accent} from '../../../utilities/colors';

import {fetchLocalStorage} from '../../../storage/db';

const theme = {
  colors: {primary: accent, underlineColor: 'transparent'},
};

export default class Login extends React.Component {
  state = {
    username: '',
    name: '',
    email: '',
    phone_number: '',
    designationList: [],
    designation: null,
    password: '',
    confirm_password: '',
    designationDropdown: false,
    mobileCountryCode: '254',
    countryCode: 'KE',
    showSnack: false,
    message: '',
    isVisible: false,
    showPass: false,
    showPassConf: false,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    fetchLocalStorage('designations').then((data) => {
      this.setState({designationList: data});
    });
  };

  setShowHide = (field) => {
    this.setState({[field]: !this.state[field]});
  };

  closeSnackBar = () => {
    this.setShowHide('showSnack');
  };

  validateRegister() {
    let reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!this.state.username) {
      this.setState({message: 'Username is required', showSnack: true});
      return;
    }
    if (!this.state.password || !this.state.confirm_password) {
      this.setState({message: 'Password is required', showSnack: true});
      return;
    }
    if (this.state.password !== this.state.confirm_password) {
      this.setState({message: "Passwords don't match", showSnack: true});
      return;
    }
    if (!this.state.name) {
      this.setState({message: 'Name is required', showSnack: true});
      return;
    }
    if (!this.state.email) {
      this.setState({message: 'User email is required', showSnack: true});
      return;
    }
    if (reg.test(this.state.email) === false) {
      this.setState({message: 'User email is not valid', showSnack: true});
      return;
    }

    this.props.navigation.navigate('Institution', {
      user_params: this.state,
    });
  }

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <KeyboardAvoidingView
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 200 : moderateScale(-150)
          }
          behavior={'padding'}
          style={styles.viewOuter}>
          <View style={styles.viewContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'always'}>
              <TextInput
                theme={theme}
                mode="outlined"
                label="Username *"
                placeholder="Username *"
                value={this.state.username}
                onChangeText={(text) => this.setState({username: text})}
              />
              <TextInput
                theme={theme}
                mode="outlined"
                label="Name *"
                placeholder="Name *"
                value={this.state.name}
                onChangeText={(text) => this.setState({name: text})}
              />
              <TextInput
                theme={theme}
                mode="outlined"
                keyboardType="email-address"
                label="Email *"
                placeholder="Email"
                value={this.state.email}
                onChangeText={(text) => this.setState({email: text})}
              />

              <View style={styles.inputContainer}>
                <CountryPicker
                  onSelect={(value) => {
                    this.setState({
                      countryCode: value.cca2 ? value.cca2 : 'KE',
                      mobileCountryCode: value.callingCode[0]
                        ? value.callingCode[0]
                        : '254',
                    });
                  }}
                  countryCode={this.state.countryCode}
                  translation="eng"
                />

                <View style={styles.viewCountryCode}>
                  <CountryPicker
                    visible={this.state.isVisible}
                    onClose={() => this.setState({isVisible: false})}
                    style={styles.cpWidth}
                    onSelect={(value) =>
                      this.setState({
                        countryCode: value.cca2,
                        mobileCountryCode: value.callingCode[0],
                      })
                    }
                    countryCode={this.state.countryCode}
                    withFlagButton={false}
                    withCallingCode={true}
                    withCallingCodeButton={true}
                    translation="eng"
                  />
                  <Icon
                    onPress={() => this.setState({isVisible: true})}
                    style={styles.iconCavet}
                    name="caret-down"
                    type="FontAwesome"
                  />
                </View>
                <TextInput
                  theme={theme}
                  mode="outlined"
                  label="Phone Number"
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  value={this.state.phone_number}
                  style={styles.textInput}
                  onChangeText={(text) => this.setState({phone_number: text})}
                />
              </View>

              {this.state.designationList &&
                this.state.designationList.length > 0 && (
                  <DropDown
                    label={'Designation'}
                    mode={'outlined'}
                    visible={this.state.designationDropdown}
                    showDropDown={() => this.setShowHide('designationDropdown')}
                    onDismiss={() => this.setShowHide('designationDropdown')}
                    value={this.state.designation}
                    setValue={(designation) => {
                      this.setState({designation: designation});
                    }}
                    list={this.state.designationList}
                  />
                )}

              <TextInput
                theme={theme}
                mode="outlined"
                label="Password *"
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
                Next
              </Button>

              <Text style={styles.textLoginMsg}>
                Already have an account?{' '}
                <Text
                  style={styles.textLogin}
                  onPress={() => {
                    this.props.navigation.navigate('Login');
                  }}>
                  Login
                </Text>
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  viewOuter: {
    flex: 1,
  },
  cpWidth: {
    width: 50,
  },
  iconCavet: {
    margin: 5,
  },
  viewContainer: {
    marginTop: moderateScale(20),
    marginLeft: moderateScale(30),
    marginRight: moderateScale(30),
  },
  buttonDesignation: {
    height: moderateScale(50),
    alignItems: 'flex-start',
  },
  button: {
    marginTop: moderateScale(15),
    width: moderateScale(100),
    justifyContent: 'center',
    backgroundColor: accent,
    alignSelf: 'flex-end',
  },
  textInput: {
    width: '65%',
  },
  textButton: {
    color: 'white',
  },
  viewCountryCode: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: 'grey',
    borderRadius: moderateScale(5),
  },
  textLogin: {
    fontSize: moderateScale(15),
    textDecorationLine: 'underline',
    color: accent,
  },
  textLoginMsg: {
    fontSize: moderateScale(14),
  },
});

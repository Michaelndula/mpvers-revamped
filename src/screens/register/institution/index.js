import React from 'react';
import {
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  View,
  Text,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import {CommonActions} from '@react-navigation/routers';
import {List, TextInput, Snackbar, Button, Checkbox} from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import {moderateScale} from 'react-native-size-matters';
import {
  withNetwork,
  networkCall,
  post_call,
} from '../../../services/network';
import Container from '../../../ui/components/container';
import {accent, green, primary} from '../../../utilities/colors';
import {fetchLocalStorage} from '../../../storage/db';

const theme = {
  colors: {primary: accent, underlineColor: 'transparent'},
};

export default class Institution extends React.Component {
  constructor(props) {
    super(props);
    const user_params = this.props.route.params
      ? this.props.route.params.user_params
      : null;

    this.state = {
      showCompanyEmail: false,
      company_email: null,
      institution_name: null,
      institution_code: null,
      institution_contacts: null,
      institution_address: null,
      institution_email: null,
      county: '',
      countyDropdown: false,
      codeChallenge: [],
      code_answer: null,
      user_details: user_params,
      loading: false,
      countyList: [],
      instituteList: [],
      showList: false,
      showSnack: false,
      message: '',
    };

    this.setValue = this.setValue.bind(this);
  }

  componentDidMount() {
    this.randomChallenge();
    this.loadData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({user_details: nextProps.route.params.user_params});
  }

  loadData = () => {
    fetchLocalStorage('counties').then((data) => {
      this.setState({countyList: data});
    });
  };

  openCloseMenu = () => {
    this.setState({countyDropdown: !this.state.countyDropdown});
  };

  closeSnackBar = () => {
    this.setState({showSnack: !this.state.showSnack});
  };

  humanize(num) {
    var ones = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
    ];

    if (num < 0) {
      throw new Error('Negative numbers are not supported.');
    }

    if (num === 0) {
      return 'zero';
    }

    //the case of 1 - 20
    if (num <= 10) {
      return ones[num];
    }
  }

  randomChallenge() {
    let num1 = Math.floor(Math.random() * 10 + 1);
    let num2 = Math.floor(Math.random() * 10 + 1);
    let sum = num1 + num2;
    this.setState({codeChallenge: [num1, this.humanize(num2), sum]});
  }

  setValue(callback) {
    this.setState((state) => ({
      county: callback(state.value),
    }));
  }

  register = () => {
    this.validateRegister();

    Keyboard.dismiss();
    this.setState({loading: true});
    withNetwork(
      () => {
        let user = {
          User: {
            designation_id: this.state.user_details.designation_id,
            county_id: this.state.user_details.county,
            username: this.state.user_details.username,
            password: this.state.user_details.password,
            confirm_password: this.state.user_details.confirm_password,
            name: this.state.user_details.name,
            email: this.state.user_details.email,
            name_of_institution: this.state.institution_name,
            institution_address: this.state.institution_address,
            institution_code: this.state.institution_code,
            institution_contact: this.state.institution_contacts,
            institution_email: this.state.institution_email,
            ward: null,
            phone_no:
              this.state.user_details.mobileCountryCode +
              this.state.user_details.phone_number,
            user_type: this.state.showCompanyEmail,
            sponsor_email: this.state.company_email,
          },
        };

        post_call('users/register', null, user)
          .then((response) => {
            this.setState({loading: false});
            if (response.data.status === 'success') {
              this.setState({
                message:
                  'Your account has been successfully registered, an email has been sent. Click on the link in email to activate the account',
                showSnack: true,
              });
              setTimeout(() => {
                const resetAction = CommonActions.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                });
                this.props.navigation.dispatch(resetAction);
              }, 5000);
            } else {
              let message =
                'Sorry, there was an error registering your account.';
              if (response.data?.validation) {
                for (let key in response.data?.validation) {
                  message = response.data?.validation[key];
                }
              }
              this.setState({
                message: message,
                showSnack: true,
              });
            }
          })
          .catch((error) => {
            this.setState({loading: false});
            this.setState({
              message: 'Sorry, account could not be registered.',
              showSnack: true,
            });
          });
      },
      () => {
        this.setState({loading: false});
      },
    );
  };

  validateRegister() {
    let reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!this.state.user_details?.username) {
      this.setState({message: 'Username is required', showSnack: true});
      return;
    }
    if (
      !this.state.user_details?.password ||
      !this.state.user_details?.confirm_password
    ) {
      this.setState({message: 'Password is required', showSnack: true});
      return;
    }
    if (
      this.state.user_details?.password !==
      this.state.user_details?.confirm_password
    ) {
      this.setState({message: "Passwords don't match", showSnack: true});
      return;
    }
    if (!this.state.user_details?.name) {
      this.setState({message: 'Name is required', showSnack: true});
      return;
    }
    if (!this.state.user_details?.email) {
      this.setState({message: 'User email is required', showSnack: true});
      return;
    }
    if (reg.test(this.state.user_details?.email) === false) {
      this.setState({message: 'User email is not valid', showSnack: true});
      return;
    }

    if (this.state.showCompanyEmail && !this.state.company_email) {
      this.setState({message: 'Company email is required', showSnack: true});
      return;
    }

    if (!this.state.code_answer) {
      this.setState({message: 'Code challenge is required', showSnack: true});
      return;
    }

    if (parseInt(this.state.code_answer, 10) !== this.state.codeChallenge[2]) {
      this.setState({
        message: 'Code challenge failed, try again',
        showSnack: true,
      });
      return;
    }
  }

  searchChangeText = (text) => {
    if (text.length > 1) {
      withNetwork(() => {
        networkCall(
          'facility_codes/autocomplete.json?term=' + text,
          'GET',
        ).then((response) => {
          this.setState({
            instituteList: response.data,
            showList: true,
          });
        });
      });
    } else {
      this.setState({instituteList: [], showList: false});
    }
  };

  setInstitute = (institute) => {
    let selectCounty = null;
    const county = this.state.countyList.filter(
      (sitem) => sitem.label === institute.desc,
    );

    if (county.length > 0) {
      selectCounty = county[0].value;
    }

    this.setState({
      institution_name: institute.label,
      institution_address: institute.addr,
      institution_contacts: institute.phone,
      county: selectCounty,
    });
  };
  render() {
    const messageChallenge = `${this.state.codeChallenge[0]} + ${this.state.codeChallenge[1]} `;
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <KeyboardAvoidingView
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 200 : moderateScale(-175)
          }
          behavior={'padding'}
          style={styles.viewOuter}>
          <View style={styles.viewContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'always'}>
              <View style={styles.viewCompanyEmail}>
                <Checkbox
                  status={this.state.showCompanyEmail ? 'checked' : 'unchecked'}
                  onPress={() => {
                    this.setState({
                      showCompanyEmail: !this.state.showCompanyEmail,
                    });
                  }}
                />
                <Text style={styles.marketAuthorityTest}>
                  Are you reporting for market authority?
                </Text>
              </View>

              {this.state.showCompanyEmail && (
                <TextInput
                  theme={theme}
                  mode="outlined"
                  label="Company Email *"
                  placeholder="Company Email *"
                  value={this.state.company_email}
                  onChangeText={(text) => this.setState({company_email: text})}
                />
              )}
              <TextInput
                theme={theme}
                mode="outlined"
                label="Institution Name"
                placeholder="Institution Name"
                value={this.state.institution_name}
                onChangeText={(text) => {
                  this.setState({institution_name: text});
                  this.searchChangeText(text);
                }}
              />
              {this.state.showList && (
                <View style={styles.listFacilities}>
                  {this.state.instituteList.length > 0 &&
                    this.state.instituteList.map((institute, index) => {
                      return (
                        <List.Item
                          key={index}
                          title={institute.label}
                          onPress={() => {
                            Keyboard.dismiss();
                            this.setInstitute(institute);
                            this.setState({showList: false});
                          }}
                        />
                      );
                    })}
                </View>
              )}
              <TextInput
                theme={theme}
                mode="outlined"
                type="email"
                label="Insitution Email"
                placeholder="Institution Email"
                keyboardType="email-address"
                value={this.state.institution_email}
                onChangeText={text => this.setState({institution_email: text})}
              />
              <TextInput
                theme={theme}
                mode="outlined"
                label="Institution Number"
                placeholder="Institution Number"
                keyboardType="phone-pad"
                returnKeyType="done"
                value={this.state.institution_contacts}
                onChangeText={(text) =>
                  this.setState({institution_contacts: text})
                }
              />

              <TextInput
                theme={theme}
                mode="outlined"
                label="Institution Address"
                placeholder="Institution Address"
                value={this.state.institution_address}
                onChangeText={(text) =>
                  this.setState({institution_address: text})
                }
              />
              <DropDown
                label={'County'}
                mode={'outlined'}
                visible={this.state.countyDropdown}
                showDropDown={() => this.openCloseMenu()}
                onDismiss={() => this.openCloseMenu()}
                value={this.state.county}
                setValue={(county) => {
                  this.setState({county: county});
                }}
                list={this.state.countyList}
              />

              {this.state.codeChallenge.length > 0 && (
                <View style={styles.viewChallenge}>
                  <Text style={styles.textChallenge}>{messageChallenge}</Text>
                  <TextInput
                    theme={theme}
                    mode="outlined"
                    label="Code Challenge *"
                    placeholder="Sum"
                    value={this.state.code_answer}
                    onChangeText={(text) => this.setState({code_answer: text})}
                    left={<TextInput.Affix text="=" />}
                    style={styles.textInputChallenge}
                    keyboardType={'numeric'}
                    returnKeyType="done"
                  />
                </View>
              )}

              {!this.state.countyDropdown && (
                <Button
                  mode="contained"
                  style={styles.button}
                  labelStyle={styles.labelColor}
                  loading={this.state.loading}
                  onPress={() => {
                    this.register();
                  }}>
                  Submit
                </Button>
              )}

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
  labelColor: {
    color: 'white',
  },
  viewOuter: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    marginTop: moderateScale(20),
    marginLeft: moderateScale(30),
    marginRight: moderateScale(30),
  },
  marketAuthorityTest: {
    color: accent,
  },
  viewCompanyEmail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDesignation: {
    height: moderateScale(50),
    alignItems: 'flex-start',
  },
  textInput: {
    marginTop: moderateScale(15),
  },
  button: {
    width: moderateScale(100),
    justifyContent: 'center',
    backgroundColor: green,
    alignSelf: 'flex-end',
  },
  viewChallenge: {
    marginVertical: moderateScale(15),
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  textChallenge: {
    width: '30%',
    color: accent,
    fontSize: moderateScale(15),
  },
  textInputChallenge: {
    width: '70%',
  },
  textLogin: {
    fontSize: moderateScale(15),
    textDecorationLine: 'underline',
    color: accent,
  },
  textLoginMsg: {
    color: primary,
    fontSize: moderateScale(14),
  },
  listFacilities: {
    elevation: 3,
    borderColor: 'grey',
    borderRadius: moderateScale(0.5),
    backgroundColor: 'white',
  },
});

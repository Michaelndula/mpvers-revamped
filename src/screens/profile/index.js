import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {BackHandler, Platform} from 'react-native';
import {
  View,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import DropDown from 'react-native-paper-dropdown';
import {moderateScale} from 'react-native-size-matters';
import {List, TextInput, Button} from 'react-native-paper';
import allActions from '../../actions';
import Container from '../../ui/components/container';
import Header from '../../ui/header';
import {withNetwork, get_call, post_call} from '../../services/network';
import {accent, green} from '../../utilities/colors';
import {fetchLocalStorage, storeLocalStorage} from '../../storage/db';

const theme = {
  colors: {primary: accent, underlineColor: 'transparent'},
};

class Profile extends React.Component {
  state = {
    username: this.props.user.username,
    name: this.props.user.name,
    email: this.props.user.email,
    phone_number: this.props.user.phone_no,
    designationList: [],
    designation: this.props.user.designation_id,
    designationDropdown: false,
    instituteList: [],
    institution_name: this.props.user.name_of_institution,
    institution_code: this.props.user.institution_code,
    institution_contact: this.props.user.institution_contact,
    institution_address: this.props.user.institution_address,
    institution_email: this.props.user.institution_email,
    county_id: this.props.user.county_id,
    countyList: [],
    countyDropdown: false,
    showList: false,
    loading: false,
  };

  componentDidMount() {
    this.loadData();
    if (Platform.OS === 'android') {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBack,
      );
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.backHandler.remove();
    }
  }

  handleBack = () => {
    return true;
  };

  loadData = () => {
    fetchLocalStorage('designations').then((data) => {
      this.setState({designationList: data});
    });
    fetchLocalStorage('counties').then((data) => {
      this.setState({countyList: data});
    });
  };

  submitProfile = () => {
    this.setState({loading: true});
    withNetwork(
      () => {
        let url = `users/profile/${this.props.user.id}`;
        let user = {
          User: {
            designation_id: this.state.designation,
            county_id: this.state.county_id,
            username: this.state.username,
            name: this.state.name,
            email: this.state.email,
            phone_no: this.state.phone_number,
            name_of_institution: this.state.institution_name,
            institution_address: this.state.institution_address,
            institution_code: this.state.institution_code,
            institution_contact: this.state.institution_contact,
            institution_email: this.state.institution_email,
          },
        };

        post_call(url, this.props.authToken, user).then((response) => {
          if (response.data.status === 'success') {
            this.setState({loading: false}, () => {
              let user_data = response.data.user.User;
              user_data.id = this.props.user.id;
              storeLocalStorage('user', user_data).then(() => {
                this.props.setUser(user_data);
                Alert.alert('Profile Updated', response.data.message);
                this.goBack();
              });
            });
          } else {
            this.setState({loading: false});
            Alert.alert('Profile Error', response.data.message);
          }
        });
      },
      () => {
        this.setState({loading: false});
        Alert.alert(' Error', 'There was an error submitting your profile');
      },
    );
  };

  searchChangeText = (text) => {
    if (text.length > 1) {
      withNetwork(() => {
        get_call('facility_codes/autocomplete.json?term=' + text).then(
          (response) => {
            this.setState({
              instituteList: response.data,
              showList: true,
            });
          },
        );
      });
    } else {
      this.setState({instituteList: [], showList: false});
    }
  };

  setInstitute = (institute) => {
    let county_id = null;
    const county = this.state.countyList.filter(
      (sitem) => sitem.label === institute.desc,
    );

    if (county.length > 0) {
      county_id = county[0].value;
    }

    this.setState({
      institution_name: institute.label,
      institution_address: institute.addr,
      institution_contact: institute.phone,
      county_id: county_id,
    });
  };

  openCloseMenu = (field) => {
    this.setState({[field]: !this.state[field]});
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
        <Header title="Profile" goBack={this.goBack} />

        <>
          <KeyboardAvoidingView
            keyboardVerticalOffset={moderateScale(-150)}
            behavior={'height'}
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

                <TextInput
                  theme={theme}
                  mode="outlined"
                  label="Phone Number"
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={this.state.phone_number}
                  onChangeText={(text) => this.setState({phone_number: text})}
                />

                {this.state.designationList &&
                  this.state.designationList.length > 0 && (
                    <DropDown
                      label={'Designation'}
                      mode={'outlined'}
                      visible={this.state.designationDropdown}
                      showDropDown={() =>
                        this.openCloseMenu('designationDropdown')
                      }
                      onDismiss={() =>
                        this.openCloseMenu('designationDropdown')
                      }
                      value={this.state.designation}
                      setValue={(designation) => {
                        this.setState({designation: designation});
                      }}
                      list={this.state.designationList}
                    />
                  )}

                {this.state.countyList && this.state.countyList.length > 0 && (
                  <DropDown
                    label={'County'}
                    mode={'outlined'}
                    visible={this.state.countyDropdown}
                    showDropDown={() => this.openCloseMenu('countyDropdown')}
                    onDismiss={() => this.openCloseMenu('countyDropdown')}
                    value={this.state.county_id}
                    setValue={(county_id) => {
                      this.setState({county_id: county_id});
                    }}
                    list={this.state.countyList}
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
                    this.searchChangeText(text.toLowerCase());
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
                  onChangeText={(text) =>
                    this.setState({institution_email: text})
                  }
                />
                <TextInput
                  theme={theme}
                  mode="outlined"
                  label="Institution Contacts"
                  placeholder="Institution Contacts"
                  keyboardType="phone-pad"
                  value={this.state.institution_contact}
                  onChangeText={(text) =>
                    this.setState({institution_contact: text})
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

                <Button
                  mode="contained"
                  style={styles.button}
                  labelStyle={styles.textButton}
                  loading={this.state.loading}
                  onPress={() => this.submitProfile()}>
                  Submit
                </Button>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </>
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
    marginBottom: moderateScale(15),
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
  listFacilities: {
    elevation: 3,
    borderColor: 'grey',
    borderRadius: moderateScale(0.5),
    backgroundColor: 'white',
  },
});

const mapStateToProps = (state) => {
  return {
    authToken: state.currentUser?.token,
    user: state.currentUser?.user,
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setUser: allActions.userActions.setUser,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

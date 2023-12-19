import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import moment from 'moment';
import { Title, Button, Dialog, Portal } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';

import { storeLocalStorage } from '../../storage/db';
import { light_grey, primary, accent } from '../../utilities/colors';
import Container from '../../ui/components/component';
import { sortKeyValue, sortLinkedData } from '../../utilities/validation';
import { withNetwork, networkCall } from '../../services/network';
const arms = require('../../../assets/arms.png');

export default class Introduction extends React.Component {
  state = {
    loadingData: true,
    visible: false,
  };

  redirect(route, form) {
    this.setState({ visible: false });
    this.props.navigation.navigate(route, {
      form_id: moment().format('YYYY-MM-DD HH:mm:ss'),
      form_type: form,
      form_data: [],
    });
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    withNetwork(() => {
      networkCall('countries').then((cr) => {
        storeLocalStorage('countries', sortKeyValue(cr.data.countries)).then(
          () => {
            networkCall('counties').then((c) => {
              storeLocalStorage('counties', sortKeyValue(c.data.counties)).then(
                () => {
                  networkCall('sub_counties').then((sc) => {
                    storeLocalStorage(
                      'subcounties',
                      sortLinkedData(sc.data.subCounties),
                    ).then(() => {
                      networkCall('designations').then((d) => {
                        storeLocalStorage(
                          'designations',
                          sortKeyValue(d.data.designations),
                        ).then(() => {
                          networkCall('vaccines').then((v) => {
                            storeLocalStorage(
                              'vaccines',
                              sortKeyValue(v.data.vaccines),
                            ).then(() => {
                              networkCall('doses').then((ds) => {
                                storeLocalStorage(
                                  'doses',
                                  sortKeyValue(ds.data.doses),
                                ).then(() => {
                                  networkCall('routes').then((r) => {
                                    storeLocalStorage(
                                      'routes',
                                      sortKeyValue(r.data.routes),
                                    ).then(() => {
                                      networkCall('frequencies').then((f) => {
                                        storeLocalStorage(
                                          'frequencies',
                                          sortKeyValue(f.data.frequencies),
                                        ).then(() => {
                                          this.setState({ loadingData: false });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                },
              );
            });
          },
        );
      });
    });
  };

  toggleDialog = () => {
    this.setState({ visible: !this.state.visible });
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <ScrollView>
          <View style={styles.main}>
            <View style={styles.viewImage}>
              <Image
                style={styles.imageArms}
                source={arms}
                resizeMode="contain"
              />
            </View>
            <View style={styles.viewInfo}>
              <Text style={styles.titleText}>PvERS</Text>
              <Title style={styles.subTitleText}>Who Can Report ?</Title>
              <Text style={styles.text}>
                Health care workers and professionals can report adverse drug
                reactions, adverse events following immunization and incidents
                involving medical devices or poor quality medicinal products.
                All health care workers are required to register first before
                they can submit reports. The registration details will be used
                for communication and follow up.{'\n\n'}
                Any member of the public is able to report any cases of adverse
                drug reactions or incidents involving medical devices.
              </Text>
              {!this.state.loadingData && (
                <View>
                  <View style={styles.viewButtons}>
                    <Button
                      mode="contained"
                      style={styles.button}
                      onPress={() =>
                        //this.redirect('Register')
                        this.toggleDialog()
                      }>
                      Health Worker
                    </Button>
                    <Portal>
                      <Dialog
                        visible={this.state.visible}
                        onDismiss={this.toggleDialog}>
                        <Dialog.Title>Health Worker</Dialog.Title>
                        <Dialog.Actions style={styles.dialog}>
                          <Button
                            mode="contained"
                            style={[
                              styles.button,
                              {
                                width: moderateScale(120),
                                marginRight: moderateScale(10),
                              },
                            ]}
                            onPress={() => this.redirect('Register')}>
                            Register
                          </Button>
                          <Button
                            mode="contained"
                            style={[
                              styles.button,
                              {
                                backgroundColor: light_grey,
                                width: moderateScale(120),
                              },
                            ]}
                            onPress={() => this.redirect('Dashboard')}>
                            Guest
                          </Button>
                        </Dialog.Actions>
                      </Dialog>
                    </Portal>
                    <View style={{ marginVertical: moderateScale(5) }} />
                    <Button
                      mode="contained"
                      style={[styles.button, { backgroundColor: light_grey }]}
                      onPress={() => this.redirect('FormAdd', 'padr')}>
                      Public
                    </Button>
                  </View>
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
                </View>
              )}
              {this.state.loadingData && (
                <View style={styles.viewMessage}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text>Please wait will we update a few items</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
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
  dialog: {
    justifyContent: 'center',
  },
  viewImage: {
    height: moderateScale(175),
    backgroundColor: primary,
  },
  imageArms: {
    height: moderateScale(75),
    marginTop: moderateScale(50),
  },
  viewInfo: {
    width: '100%',
    marginTop: moderateScale(-30),
    marginBottom: moderateScale(15),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopStartRadius: moderateScale(30),
  },
  titleText: {
    color: 'grey',
    fontSize: moderateScale(35),
    fontWeight: 'bold',
    marginTop: moderateScale(15),
  },
  subTitleText: {
    fontSize: moderateScale(20),
  },
  text: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    marginTop: moderateScale(10),
    color: accent,
    marginHorizontal: moderateScale(10),
  },
  viewButtons: {
    width: '97.5%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: moderateScale(15),
  },
  button: {
    width: moderateScale(175),
    justifyContent: 'center',
    padding: moderateScale(5),
  },
  viewMessage: {
    marginTop: moderateScale(25),
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textLogin: {
    fontSize: moderateScale(15),
    textDecorationLine: 'underline',
    color: accent,
  },
  textLoginMsg: {
    marginTop: moderateScale(10),
    fontSize: moderateScale(14),
    textAlign: 'center',
    color: accent
  },
  afyamoja: {
    height: moderateScale(25),
    marginBottom: moderateScale(15),
  },
});


import React from 'react';
import moment from 'moment';
import {
  StatusBar,
  ScrollView,
  View,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {moderateScale} from 'react-native-size-matters';
import {Title, Button, Snackbar} from 'react-native-paper';

import Header from '../../../ui/header';
import Container from '../../../ui/components/container';
import QuestionView from '../../../ui/components/questionview';

import {withNetwork, get_call, API_URL} from '../../../services/network';
import {accent, green, blue, purple} from '../../../utilities/colors';
import {setForm} from '../../../form_data';
import {fetchLocalStorage} from '../../../storage/db';
import {
  capitalizeFirstLetter,
  setBackground,
} from '../../../utilities/validation';

class FormView extends React.Component {
  constructor(props) {
    super(props);

    const {form_type, answers} = this.props.route.params;

    this.state = {
      formType: form_type,
      formData: setForm(form_type),
      completeForm: answers,
      answers: answers[capitalizeFirstLetter(form_type)],
      aefivaccines: form_type === 'aefi' ? answers.AefiListOfVaccine : [],
      aefidescriptions: form_type === 'aefi' ? answers.AefiDescription : [],
      sadrdrugs: form_type === 'sadr' ? answers.SadrListOfDrug : [],
      sadrmedicines: form_type === 'sadr' ? answers.SadrListOfMedicine : [],
      sadrdescriptions: form_type === 'sadr' ? answers.SadrDescription : [],
      devicelist: form_type === 'device' ? answers?.ListOfDevice : [],
      medicationproducts:
        form_type === 'medication' ? answers?.MedicationProduct : [],
      pints: form_type === 'transfusion' ? answers?.Pint : [],
      section_id: 1,
      vaccines: [],
      countries: [],
      counties: [],
      subcounties: [],
      designations: [],
      showSnackbar: false,
      message: null,
      backgroundColor: blue,
      attachments: [],
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {form_type, answers} = nextProps.route.params;

    this.setState(
      {
        formType: form_type,
        formData: setForm(form_type),
        completeForm: answers,
        answers: answers[capitalizeFirstLetter(form_type)],
        aefivaccines: form_type === 'aefi' ? answers?.AefiListOfVaccine : [],
        aefidescriptions: form_type === 'aefi' ? answers?.AefiDescription : [],
        sadrdrugs: form_type === 'sadr' ? answers?.SadrListOfDrug : [],
        sadrmedicines: form_type === 'sadr' ? answers?.SadrListOfMedicine : [],
        sadrdescriptions: form_type === 'sadr' ? answers?.SadrDescription : [],
        devicelist: form_type === 'device' ? answers?.ListOfDevice : [],
        medicationproducts:
          form_type === 'medication' ? answers?.MedicationProduct : [],
        pints: form_type === 'transfusion' ? answers?.Pint : [],
        attachments: [],
      },
      () => {
        this.viewForm();
      },
    );
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    fetchLocalStorage('countries').then((data) => {
      this.setState({countries: data});
    });

    fetchLocalStorage('counties').then((data) => {
      this.setState({counties: data});
    });

    fetchLocalStorage('subcounties').then((data) => {
      this.setState({subcounties: data});
    });

    fetchLocalStorage('designations').then((data) => {
      this.setState({designations: data});
    });

    fetchLocalStorage('vaccines').then((data) => {
      this.setState({vaccines: data});
    });

    this.viewForm();
  };

  viewForm = () => {
    withNetwork(
      () => {
        let formCapital = capitalizeFirstLetter(this.state.formType);
        let form_type = this.state.formType + 's';
        let url = `${form_type}/view/${this.state.answers.id}`;

        get_call(url, this.props.authToken)
          .then((response) => {
            let form = response.data[this.state.formType];
            this.setState({
              answers: form[formCapital],
              completeForm: form,
              aefivaccines:
                form_type === 'aefis' ? form?.AefiListOfVaccine : [],
              aefidescriptions:
                form_type === 'aefis' ? form?.AefiDescription : [],
              sadrdrugs: form_type === 'sadrs' ? form?.SadrListOfDrug : [],
              sadrmedicines:
                form_type === 'sadrs' ? form?.SadrListOfMedicine : [],
              sadrdescriptions:
                form_type === 'sadrs' ? form?.SadrDescription : [],
              devicelist: form_type === 'devices' ? form?.ListOfDevice : [],
              medicationproducts:
                form_type === 'medications' ? form?.MedicationProduct : [],
              pints: form_type === 'transfusions' ? form?.Pint : [],
              attachments: form?.Attachment,
            });
          })
          .catch((error) => {
            if (error.response.status === 401) {
              Alert.alert('Error', 'There was an error loading your data');
            }
          });
      },
      () => {
        this.setState({isInternetReachable: false, loading: false, forms: []});
      },
    );
  };

  download = async () => {
    let granted;
    if (Platform.OS === 'android') {
      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
    }

    if (
      granted === PermissionsAndroid.RESULTS.GRANTED ||
      Platform.OS === 'ios'
    ) {
      const {config, fs} = RNFetchBlob;

      let options = {
        fileCache: true,
        //  appendExt : extension, //Adds Extension only during the download, optional
        addAndroidDownloads: {
          useDownloadManager: true, //uses the device's native download manager.
          notification: true,
          //  mime: 'text/plain',
          title: `${this.state.formType.toUpperCase()} Form`, // Title of download notification.
          path: `${fs.dirs.DownloadDir}/ ${this.state.answers.reference_no}.pdf`, // this is the path where your download file will be in
          description: 'Downloading form.',
        },
      };
      this.setState({
        showSnackbar: true,
        backgroundColor: blue,
        message: `Downloading ${this.state.answers.reference_no}`,
      });

      withNetwork(
        () => {
          let url =
            API_URL +
            this.state.formType +
            `s/view/${this.state.answers.id}.pdf`;

          config(options)
            .fetch('GET', url, {
              Accept: 'application/pdf',
              'Content-Type': 'application/pdf',
              Authorization: `Bearer ${this.props.authToken}`,
            })
            .then((response) => {
              if (Platform.OS === 'android') {
                this.setState({
                  showSnackbar: true,
                  backgroundColor: green,
                  message: `${this.state.answers.reference_no} file has been added to your downloads folder`,
                });
              } else {
                let path = `${
                  fs.dirs.DocumentDir
                }/${this.state.answers.reference_no.replaceAll('/', '_')}.pdf`;
                RNFetchBlob.fs.writeFile(path, response.data, 'base64');
                RNFetchBlob.ios.previewDocument(path);
              }
            })
            .catch((err) => {
              console.log(err);
              this.setState({
                showSnackbar: true,
                backgroundColor: 'red',
                message: `Failed to download ${this.state.answers.reference_no} file`,
              });
            });
        },
        () => {
          this.setState({
            showSnackbar: true,
            backgroundColor: 'red',
            message: 'There is no internet connection',
          });
        },
      );
    } else {
      this.setState({
        showSnackbar: true,
        backgroundColor: 'accent',
        message: 'You need to give storage permission to download the file',
      });
    }
  };

  checkSection() {
    let section = this.state.section_id;

    let form_complete = this.state.formData.findIndex((query_obj) => {
      return query_obj.section_id === section + 1;
    });

    return form_complete === -1;
  }

  updateSection = (action) => {
    let section = this.state.section_id;
    section = action === 'next' ? section + 1 : section - 1;

    let form_complete = this.state.formData.findIndex((query_obj) => {
      return query_obj.section_id === section;
    });

    if (form_complete !== -1) {
      this.setState({section_id: section}, () => {
        this.srollViewMain.scrollTo({x: 0, y: 0, animated: true});
      });
    }
  };

  getAnswers(form) {
    if (this.state.answers) {
      let ans = this.state.answers[form.question_id];
      if (
        (form.question_id === 'date_of_birth' &&
          this.state.formType === 'padr') ||
        (form.question_id === 'date_of_birth' &&
          this.state.formType === 'aefi') ||
        (form.question_id === 'date_of_birth' &&
          this.state.formType === 'pqmp') ||
        (form.question_id === 'date_of_birth' &&
          this.state.formType === 'sadr') ||
        (form.question_id === 'manufacture_date' &&
          this.state.formType === 'pqmp') ||
        form.question_id === 'date_of_onset_of_reaction'
      ) {
        if (this.state.answers[form.question_id]) {
          ans =
            this.state.answers[form.question_id].year +
            '-' +
            this.state.answers[form.question_id].month +
            '-' +
            this.state.answers[form.question_id].day;
        }
      } else if (
        form.question_id === 'time_aefi_started' ||
        form.question_id === 'time_of_event'
      ) {
        if (this.state.answers[form.question_id]) {
          ans =
            this.state.answers[form.question_id].hour +
            ':' +
            this.state.answers[form.question_id].min;
        }
      } else if (
        this.state.answers[form.question_id] &&
        form.answer_type === 'checkbox'
      ) {
        ans = this.state.answers[form.question_id] ? '1' : '0';
      } else if (form.question_id === 'country_of_origin') {
        if (this.state.answers[form.question_id]) {
          ans = this.state.countries
            .filter(
              (item) =>
                item.value === this.state.answers[form.question_id].toString(),
            )
            .map((item) => item.label);
        }
      } else if (
        form.question_id === 'sub_county_id' ||
        form.question_id === 'patient_sub_county'
      ) {
        if (this.state.answers[form.question_id]) {
          ans = this.state.subcounties
            .filter(
              (item) =>
                item.value === this.state.answers[form.question_id].toString(),
            )
            .map((item) => item.label);
        }
      } else if (
        form.question_id === 'county_id' ||
        form.question_id === 'patient_county' ||
        form.question_id === 'vaccination_county'
      ) {
        if (this.state.answers[form.question_id]) {
          ans = this.state.counties
            .filter(
              (item) =>
                item.value === this.state.answers[form.question_id].toString(),
            )
            .map((item) => item.label);
        }
      } else if (
        form.question_id === 'designation_id' ||
        form.question_id === 'reporter_designation_diff'
      ) {
        if (this.state.answers[form.question_id]) {
          ans = this.state.designations
            .filter(
              (item) =>
                item.value === this.state.answers[form.question_id].toString(),
            )
            .map((item) => item.label);
        }
      } else if (form.question_id === 'AefiListOfVaccine') {
        if (this.state.aefivaccines.length > 0) {
          ans = this.state.aefivaccines;
        }
      } else if (form.question_id === 'AefiDescription') {
        if (this.state.aefidescriptions.length > 0) {
          ans = this.state.aefidescriptions;
        }
      } else if (form.question_id === 'SadrListOfDrug') {
        if (this.state.sadrdrugs && this.state.sadrdrugs.length > 0) {
          ans = this.state.sadrdrugs;
        }
      } else if (form.question_id === 'SadrListOfMedicine') {
        if (this.state.sadrmedicines && this.state.sadrmedicines.length > 0) {
          ans = this.state.sadrmedicines;
        }
      } else if (form.question_id === 'SadrDescription') {
        if (
          this.state.sadrdescriptions &&
          this.state.sadrdescriptions.length > 0
        ) {
          ans = this.state.sadrdescriptions;
        }
      } else if (form.question_id === 'ListOfDevice') {
        if (this.state.devicelist && this.state.devicelist.length > 0) {
          ans = this.state.devicelist;
        }
      } else if (form.question_id === 'MedicationProduct') {
        if (
          this.state.medicationproducts &&
          this.state.medicationproducts.length > 0
        ) {
          ans = this.state.medicationproducts;
        }
      } else if (form.question_id === 'Pint') {
        if (this.state.pints && this.state.pints.length > 0) {
          ans = this.state.pints;
        }
      } else if (form.question_id === 'Attachment') {
        if (this.state.attachments && this.state.attachments.length > 0) {
          ans = this.state.attachments;
        }
      }
      return ans;
    }
  }

  goBack = () => {
    this.setState({section_id: 1, answers: []});
    this.props.navigation.navigate('FormList', {
      form_type: this.state.formType,
    });
  };

  onDismissSnackBar = () => {
    this.setState({showSnackbar: false, message: null});
  };

  render() {
    return (
      <Container style={{backgroundColor: setBackground(this.state.formType)}}>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header title="Forms" goBack={this.goBack} download={this.download} />
        <Title style={styles.textTitle}>
          {this.state.formType.toUpperCase()} Reporting Form -{' '}
          {this.state.answers.reference_no}
        </Title>
        <ScrollView
          keyboardShouldPersistTaps="always"
          ref={(ref) => (this.srollViewMain = ref)}
          style={styles.viewInner}>
          {this.state.formData &&
            this.state.formData.map((form, index) => {
              return (
                this.state.section_id === form.section_id && (
                  <QuestionView
                    key={index}
                    form={form}
                    answer={this.getAnswers(form)}
                    answer_type={form.answer_type}
                    options={
                      form.hasOwnProperty('options')
                        ? Array.isArray(form.options)
                          ? form.options
                          : this.state[form.options]
                        : []
                    }
                    designations={this.state.designations}
                    vaccines={this.state.vaccines}
                  />
                )
              );
            })}
        </ScrollView>
        <Snackbar
          style={{backgroundColor: this.state.backgroundColor}}
          visible={this.state.showSnackbar}
          onDismiss={this.onDismissSnackBar}
          duration={5000}>
          {this.state.message}
        </Snackbar>
        <View style={styles.viewButtons}>
          <Button
            mode="contained"
            style={[styles.buttonNext, styles.buttonPrevious]}
            labelStyle={styles.labelButton}
            onPress={() => {
              if (this.state.section_id > 1) {
                this.updateSection('previous');
              }
            }}>
            Previous
          </Button>

          {this.state.formType !== 'pqmp' && (
            <Button
              mode="contained"
              style={[styles.buttonNext, styles.buttonFollowUp]}
              labelStyle={styles.labelButton}
              onPress={() =>
                this.props.navigation.navigate('FormEdit', {
                  form_id: moment().format('YYYY-MM-DD HH:mm:ss'),
                  form_data: [],
                  form_type: this.state.formType,
                  form_complete: this.state.completeForm,
                })
              }>
              FollowUp
            </Button>
          )}

          {this.checkSection() === false && (
            <Button
              mode="contained"
              style={styles.buttonNext}
              labelStyle={styles.labelButton}
              onPress={() => this.updateSection('next')}>
              Next
            </Button>
          )}
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  authToken: state.currentUser.token,
});

export default connect(mapStateToProps)(FormView);

const styles = StyleSheet.create({
  viewInner: {
    height: '70%',
    marginHorizontal: moderateScale(10),
  },
  textTitle: {
    marginLeft: moderateScale(10),
    marginTop: moderateScale(15),
  },
  viewButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(10),
    margin: moderateScale(10),
  },
  buttonNext: {
    width: moderateScale(100),
    alignItems: 'center',
    backgroundColor: green,
    alignSelf: 'flex-end',
  },
  buttonFollowUp: {
    backgroundColor: purple,
    alignSelf: 'flex-start',
  },
  buttonPrevious: {
    backgroundColor: accent,
    alignSelf: 'flex-start',
  },
  labelButton: {
    color: 'white',
    fontSize: moderateScale(10),
  },
});

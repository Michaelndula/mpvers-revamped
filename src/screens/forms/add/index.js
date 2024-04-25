import React from 'react';
import { connect } from 'react-redux';
import {
  StatusBar,
  ScrollView,
  View,
  StyleSheet,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Title, Button } from 'react-native-paper';

import Header from '../../../ui/header';
import Container from '../../../ui/components/container';
import Questions from '../../../ui/components/questions';

import { accent, green, blue, red } from '../../../utilities/colors';
import { setForm } from '../../../form_data';
import {
  generateInitialForm,
  checkSectionRequired,
  setBackground,
} from '../../../utilities/validation';
import { withNetwork, post_call } from '../../../services/network';
import { fetchLocalStorage, storeLocalStorage } from '../../../storage/db';
import {
  validateReporter,
  validateAEFI,
  validatePQHPT,
  validatePADR,
  validateSADR,
  validateDevice,
  validateMedication,
  validateTransfusion,
} from './validations';

class FormAdd extends React.Component {
  constructor(props) {
    super(props);
    const { form_type, form_id, form_data } = this.props.route.params;

    this.state = {
      loading: false,
      loadingSave: false,
      formType: form_type,
      formData: setForm(form_type),
      formID: form_id,
      formBackground: setBackground(form_type),
      answers: form_data,
      section_id: 1,
      submitForm: false,
      vaccines: [],
      countries: [],
      counties: [],
      subcounties: [],
      subcountiesFilter: [],
      designations: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { form_type, form_id, form_data } = nextProps.route.params;

    this.setState({
      section_id: 1,
      formID: form_id,
      answers: form_data,
      formType: form_type,
      formData: setForm(form_type),
      formBackground: setBackground(form_type),
    });
  }

  loadData = () => {
    fetchLocalStorage('countries').then((data) => {
      data.unshift({ label: 'Select Country', value: '' });
      this.setState({ countries: data });
    });

    fetchLocalStorage('counties').then((data) => {
      data.unshift({ label: 'Select County', value: '' });
      this.setState({ counties: data });
    });

    fetchLocalStorage('subcounties').then((data) => {
      data.unshift({ label: 'Select Sub County', value: null });
      this.setState({ subcounties: data });
    });

    fetchLocalStorage('designations').then((data) => {
      data.unshift({ label: 'Select Designation', value: '' });
      this.setState({ designations: data });
    });

    fetchLocalStorage('vaccines').then((data) => {
      data.unshift({ label: 'Select Vaccine', value: '' });
      this.setState({ vaccines: data });
    });

    this.state.formData
      .filter((query) => query.answer_type === 'checkbox')
      .map((ans) => {
        this.onChange(ans.question_id, '0');
      });
  };

  submitCompleteForm = () => {
    this.setState({ loading: true });
    let reporter_validate = validateReporter(this.state.answers);
    let form = generateInitialForm(
      this.state.formData,
      this.state.answers,
      this.state.formType,
    );

    //console.log(JSON.stringify(form));

    if (form !== null && reporter_validate) {
      withNetwork(
        () => {
          let url = this.state.formType + 's/add';
          post_call(url, this.props.authToken, form).then((response) => {
            if (response.data.status === 'success') {
              this.setState(
                { section_id: 1, loading: false, submitForm: false, answers: [] },
                () => {
                  this.updateFormList(response.data.message);
                },
              );
            } else {
              this.setState({ loading: false });
              let message = response.data.message;
              if (response.data?.validation) {
                for (let key in response.data?.validation) {
                  message = response.data?.validation[key][0];
                }
              }
              Alert.alert('Error Submission', message);
            }
          });
        },
        () => {
          let message = 'Check your internet and try again. Form auto-saved';
          this.saveForm();

          this.setState({ isInternetReachable: false, loading: false });
          Alert.alert('Internet Error', message);
        },
      );
    } else {
      this.setState({ loading: false });
    }
  };

  saveForm() {
    this.setState({ loadingSave: true });
    fetchLocalStorage(this.state.formType + '_forms').then((data) => {
      if (data === null || (data && data.length < 1)) {
        storeLocalStorage(this.state.formType + '_forms', [
          {
            form_id: this.state.formID,
            user_id: this.props.user?.id,
            report_type: 'initial',
            data: this.state.answers,
          },
        ]).then(() => this.setState({ loadingSave: false }));
      } else {
        let updated_forms = data.filter(
          (formItem) => formItem.form_id !== this.state.formID.toString(),
        );

        updated_forms.push({
          form_id: this.state.formID,
          user_id: this.props.user?.id,
          report_type: 'initial',
          data: this.state.answers,
        });

        storeLocalStorage(this.state.formType + '_forms', updated_forms).then(
          () => this.setState({ loadingSave: false }),
        );
      }
    });
  }

  updateFormList(message) {
    fetchLocalStorage(this.state.formType + '_forms').then((data) => {
      if (data) {
        let updated_forms = data.filter(
          (formItem) => formItem.form_id !== this.state.formID.toString(),
        );
        storeLocalStorage(this.state.formType + '_forms', updated_forms).then(
          () => {
            Alert.alert('Form Submission', message);
            this.goBack();
          },
        );
      } else {
        Alert.alert('Form Submission', message);
        this.goBack();
      }
    });
  }

  checkSection() {
    let section = this.state.section_id;

    let form_complete = this.state.formData.findIndex((query_obj) => {
      return query_obj.section_id === section + 1;
    });

    if (form_complete === -1 && this.state.submitForm === false) {
      this.setState({ submitForm: true });
    }

    return form_complete === -1;
  }

  updateSection(action) {
    Keyboard.dismiss();
    let required_check = false;
    let section_id = this.state.section_id;
    let section = this.state.section_id;
    section = action === 'next' ? section + 1 : section - 1;

    let form_complete = this.state.formData.filter((query_obj) => {
      return query_obj.section_id === section_id;
    });

    if (action === 'next') {
      if (this.state.formType === 'aefi') {
        required_check = validateAEFI(this.state.answers, section_id);
      } else if (this.state.formType === 'pqmp') {
        required_check = validatePQHPT(this.state.answers, section_id);
      } else if (this.state.formType === 'sadr') {
        required_check = validateSADR(this.state.answers, section_id);
      } else if (this.state.formType === 'padr') {
        required_check = validatePADR(this.state.answers, section_id);
      } else if (this.state.formType === 'device') {
        required_check = validateDevice(this.state.answers, section_id);
      } else if (this.state.formType === 'medication') {
        required_check = validateMedication(this.state.answers, section_id);
      } else if (this.state.formType === 'transfusion') {
        required_check = validateTransfusion(this.state.answers, section_id);
      }

      if (!required_check) {
        required_check = checkSectionRequired(
          form_complete,
          this.state.answers,
        );
      }
    }

    if (!required_check) {
      this.setState({ section_id: section }, () => {
        setTimeout(() => {
          this.srollViewMain.scrollTo({ x: 0, y: 0, animated: true });
        }, 1000);
      });
    }
  }

  onChange = (question_id, text) => {
    let answers = this.state.answers;

    const filter_answers = answers.filter(
      (sitem) => sitem.question_id !== question_id,
    );

    if (question_id === 'county_id' || question_id === 'patient_county') {
      this.filterList(question_id);
    }

    let answer_object = {
      question_id: question_id,
      answer: text,
    };

    filter_answers.push(answer_object);
    this.setState({ answers: filter_answers });
  };

  onChangeFacility = (question_id, choice, type) => {
    let answers = this.state.answers;
    let filter_answers = [];
    if (type === 'facility') {
      filter_answers = answers.filter(
        (sitem) =>
          sitem.question_id !== 'facility_name' &&
          sitem.question_id !== 'facility_code' &&
          sitem.question_id !== 'facility_phone' &&
          sitem.question_id !== 'facility_address',
      );

      filter_answers.push({
        question_id: 'facility_name',
        answer: choice?.label,
      });
      filter_answers.push({
        question_id: 'facility_code',
        answer: choice?.value,
      });
      filter_answers.push({
        question_id: 'facility_phone',
        answer: choice?.phone,
      });
      filter_answers.push({
        question_id: 'facility_address',
        answer: choice?.addr,
      });

      this.state.counties
        .filter((county) => county.label === choice.desc)
        .map((item) => {
          filter_answers.push({
            question_id: 'county_id',
            answer: item?.value,
          });
        });
    } else if (type === 'institute') {
      filter_answers = answers.filter(
        (sitem) =>
          sitem.question_id !== 'name_of_institution' &&
          sitem.question_id !== 'institution_code' &&
          sitem.question_id !== 'institution_contact' &&
          sitem.question_id !== 'institution_address' &&
          sitem.question_id !== 'county_id' &&
          sitem.question_id !== 'sub_county_id' &&
          sitem.question_id !== 'address',
      );

      filter_answers.push({
        question_id: 'name_of_institution',
        answer: choice?.label,
      });
      filter_answers.push({
        question_id: 'institution_code',
        answer: choice?.value,
      });

      this.state.counties
        .filter((county) => county.label === choice?.desc)
        .map((item) => {
          filter_answers.push({
            question_id: 'county_id',
            answer: item.value,
          });
        });

      if (this.state.formType === 'sadr') {
        filter_answers.push({
          question_id: 'contact',
          answer: choice?.phone,
        });
        filter_answers.push({
          question_id: 'address',
          answer: choice?.addr,
        });
      }

      if (
        this.state.formType === 'device' ||
        this.state.formType === 'medication'
      ) {
        filter_answers.push({
          question_id: 'institution_contact',
          answer: choice?.phone,
        });
        filter_answers.push({
          question_id: 'institution_address',
          answer: choice?.addr,
        });
      }
    } else {
      filter_answers = answers.filter(
        (sitem) => sitem.question_id !== question_id,
      );

      filter_answers.push({
        question_id: question_id,
        answer: choice,
      });
    }

    this.setState({ answers: filter_answers });
  };

  onAdd = async (question_id, text) => {
    let answers = this.state.answers;
    let table_answers = [];

    const current_answer = answers.filter(
      (sitem) => sitem.question_id === question_id,
    );

    if (current_answer.length > 0) {
      const filter_answers = answers.filter(
        (sitem) => sitem.question_id !== question_id,
      );
      answers = filter_answers;
      for (let i = 0; i < current_answer[0].answer.length; i++) {
        table_answers.push(current_answer[0].answer[i]);
      }
    }
    table_answers.push(text);

    let answer_object = {
      question_id: question_id,
      answer: table_answers,
    };

    answers.push(answer_object);
    this.setState({ answers: answers });
  };

  onDelete = (question_id) => {
    let answers = this.state.answers;
    const filter_answers = answers.filter(
      (sitem) => sitem.question_id !== question_id,
    );

    this.setState({ answers: filter_answers });
  };

  getAnswer(question_id) {
    const answer = this.state.answers.filter(
      (sitem) => sitem.question_id === question_id,
    );
    return answer.length > 0 ? answer[0].answer : null;
  }

  goBack = () => {
    this.setState({ section_id: 1, submitForm: false, answers: [] });
    if (!this.props.user) {
      this.props.navigation.navigate('Intro');
    } else {
      this.props.navigation.navigate('FormList', {
        form_type: this.state.formType,
      });
    }
  };

  filterList(question_id) {
    if (question_id === 'county_id') {
      this.onDelete('sub_county_id');
    } else if (question_id === 'patient_county') {
      this.onDelete('patient_sub_county');
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={
          Platform.OS === 'android' ? moderateScale(-175) : 0
        }
        behavior={'padding'}
        style={styles.viewContainer}>
        <Container style={{ backgroundColor: this.state.formBackground }}>
          <StatusBar
            translucent
            barStyle={'dark-content'}
            backgroundColor={'transparent'}
          />
          <Header title="Forms" goBack={this.goBack} />
          
          <Title style={styles.textTitle}>
            {this.state.formType !== 'device' && this.state.formType !== 'pqmp' && (
              <>{this.state.formType.toUpperCase()} </> 
            )}
            {this.state.formType === 'device' && (
              <>Medical Devices Incident </>  
            )}
            {this.state.formType === 'pqmp' && (
              <>PQHPT </>  
            )}
            Reporting Form
          </Title>

          <ScrollView
            keyboardShouldPersistTaps="always"
            ref={(ref) => (this.srollViewMain = ref)}
            style={styles.viewInner}>
            {this.state.formData &&
              this.state.formData
                .filter((item) => item.section_id === this.state.section_id)
                .map((form, index) => {
                  let linked_answer = form.hasOwnProperty('question_linked')
                    ? this.getAnswer(form.question_linked)
                    : null;

                  let options = form.hasOwnProperty('options')
                    ? Array.isArray(form.options)
                      ? form.options
                      : this.state[form.options]
                    : [];

                  return (
                    <Questions
                      key={index}
                      form={form}
                      form_type={form.question_linked}
                      user={this.props.user}
                      subcounties={this.state.subcounties}
                      answer={this.getAnswer(form.question_id)}
                      answer_linked={linked_answer}
                      options={options}
                      onChange={this.onChange}
                      onAdd={this.onAdd}
                      onDelete={this.onDelete}
                      onChangeFacility={this.onChangeFacility}
                    />
                  );
                })}
          </ScrollView>
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

            {this.state.section_id > 1 && (
              <Button
                mode="contained"
                loading={this.state.loadingSave}
                style={[styles.buttonNext, styles.buttonSave]}
                labelStyle={styles.labelButton}
                onPress={() => this.saveForm()}>
                Save
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

            {this.checkSection() === true && (
              <Button
                mode="contained"
                loading={this.state.loading}
                style={[styles.buttonNext, styles.buttonSubmit]}
                labelStyle={styles.labelButton}
                onPress={() => this.submitCompleteForm()}>
                Submit
              </Button>
            )}
          </View>
        </Container>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({
  authToken: state.currentUser?.token,
  user: state.currentUser?.user,
});

export default connect(mapStateToProps)(FormAdd);

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
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
    backgroundColor: blue,
    alignSelf: 'flex-end',
  },
  buttonPrevious: {
    backgroundColor: accent,
    alignSelf: 'flex-start',
  },
  buttonSubmit: {
    backgroundColor: green,
    alignSelf: 'flex-start',
  },
  buttonSave: {
    backgroundColor: red,
    alignSelf: 'flex-start',
  },
  labelButton: {
    color: 'white',
    fontSize: moderateScale(12),
  },
});

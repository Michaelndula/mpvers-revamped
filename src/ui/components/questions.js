import React from 'react';
import moment from 'moment';
import {
  View,
  Text,
  Modal,
  Alert,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  List,
  Checkbox,
  RadioButton,
  TextInput,
  Button,
  DataTable,
} from 'react-native-paper';

import DropDown from 'react-native-paper-dropdown';
import PropTypes from 'prop-types';
import ModalSelector from 'react-native-modal-selector-searchable';

import Icon from '../../ui/components/icon';
import {moderateScale} from 'react-native-size-matters';
import {black, green, accent} from '../../utilities/colors';
import {networkCall, withNetwork} from '../../services/network';

const theme = {
  colors: {primary: accent, underlineColor: 'transparent'},
};

import {fetchLocalStorage} from '../../storage/db';

/**
 * A re usable Icon Component.
 * @param question_id
 * @param question
 * @param answer_type
 * @param options
 * @param onPress
 * @returns {JSX.Element}
 * @constructor
 */
class Question extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      dropdownStatus: false,
      showCalender: false,
      modalTable: false,
      table_answers: [],
      vaccines: [],
      doses: [],
      routes: [],
      frequencies: [],
      multipleAnswer: null,
      isTyping: false,
      facilityList: [],
      showList: false,
      loading: false,
      image: null,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.loadData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadData = () => {
    fetchLocalStorage('vaccines').then((data) => {
      this.setState({vaccines: data});
    });

    fetchLocalStorage('doses').then((data) => {
      this.setState({doses: data});
    });

    fetchLocalStorage('routes').then((data) => {
      this.setState({routes: data});
    });

    fetchLocalStorage('frequencies').then((data) => {
      this.setState({frequencies: data});
    });
  };

  showCalender = () => {
    this.setState({showCalender: !this.state.showCalender});
  };

  setModalVisible = () => {
    this.setState({modalTable: !this.state.modalTable});
  };

  openCloseMenu = () => {
    this.setState({dropdownStatus: !this.state.dropdownStatus});
  };

  displayDate(date, mode) {
    if (mode === 'time' && date) {
      return moment(date).format('HH:mm a');
    } else if (mode === 'date' && date) {
      return moment(date).format('Do MMM, YYYY');
    } else {
      return 'Not Set';
    }
  }

  convertDate(date, mode) {
    if (mode === 'time') {
      return moment(date).format('HH:mm');
    } else if (mode === 'date') {
      return moment(date).format('YYYY-MM-DD');
    }
  }

  displayTableItems = (answer, options) => {
    let table_options = options;

    if (!Array.isArray(table_options)) {
      table_options = this.state[options];
    }
    return table_options
      .filter((item) => item.value === answer)
      .map((item) => item.label);
  };

  tableRowOrder(tableForm, formAnswers) {
    let filteredAnswers = [];
    tableForm.map((formItem) => {
      formAnswers.map((single_ans) => {
        if (formItem.question_id === single_ans.question_id) {
          if (single_ans.question_id === 'vaccine_name') {
            if (single_ans.answer === null) {
              let vaccine = formAnswers
                .filter((item) => item.question_id === 'vaccine_id')
                .map((item) => {
                  return item.answer;
                });

              let vac = this.state.vaccines
                .filter((item) => item.value === vaccine.toString())
                .map((item) => item.label);
              filteredAnswers.push(vac);
            } else {
              filteredAnswers.push(single_ans.answer);
            }
          } else if (single_ans.question_id === 'suspected_drug') {
            if (single_ans.answer === '1') {
              filteredAnswers.push('suspected');
            } else {
              filteredAnswers.push('not suspected');
            }
          } else if (formItem.answer_type === 'dropdown') {
            let ans = this.displayTableItems(
              single_ans.answer,
              formItem.options,
            );
            filteredAnswers.push(ans);
          } else {
            filteredAnswers.push(single_ans.answer);
          }
        }
      });
    });

    return filteredAnswers;
  }

  header(num_headers, options) {
    let view = [];
    for (let i = 1; i <= num_headers; i++) {
      view.push(
        <DataTable.Header key={i}>
          {options.map((option, index) => {
            return (
              <DataTable.Title key={index} style={styles.headerTable}>
                {option[i]}
              </DataTable.Title>
            );
          })}
        </DataTable.Header>,
      );
    }
    return view;
  }

  rows(rowItems, table_form, question_id, onDelete) {
    let view = [];
    for (let i = 0; i < rowItems.length; i++) {
      let newAnswerList = this.tableRowOrder(table_form, rowItems[i]);
      view.push(
        <DataTable.Row key={i}>
          {newAnswerList.map((ans, index) => {
            return (
              <DataTable.Cell key={index} style={styles.headerTable}>
                {ans}
              </DataTable.Cell>
            );
          })}
          <DataTable.Cell key={rowItems[i].length} style={styles.headerTable}>
            <Button
              mode="contained"
              style={styles.buttonDelete}
              labelStyle={styles.labelButton}
              onPress={() => {
                this.deleteTableItem(i, rowItems, question_id, onDelete);
              }}>
              Delete
            </Button>
          </DataTable.Cell>
        </DataTable.Row>,
      );
    }
    return view;
  }

  deleteTableItem(index, rowItems, question_id, onDelete) {
    let updatedAnswers = rowItems.filter((item, i) => i !== index);

    onDelete(question_id, updatedAnswers);
  }

  tableValidation(section, form) {
    let validation = true;
    for (var i = 0; i < form.length; i++) {
      const answer_check = this.state.table_answers.filter(
        (ansItem) => ansItem.question_id === form[i].question_id,
      );

      if (form[i].required === true && answer_check.length < 1) {
        validation = false;
        Alert.alert(section, form[i].question + ' is required');
        break;
      } else if (answer_check.length < 1) {
        let value = form[i].answer_type === 'checkbox' ? false : '';
        this.addAnswers(form[i].question_id, value);
      }
    }
    if (validation) {
      this.setModalVisible();
    }
    return validation;
  }

  questionAnswer(question_id) {
    const answer = this.state.table_answers.filter(
      (sitem) => sitem.question_id === question_id,
    );
    return answer.length > 0 ? answer[0].answer : null;
  }

  updateAnswer = (question_id, text) => {
    let answers = this.state.table_answers;

    const filter_answers = answers.filter(
      (sitem) => sitem.question_id !== question_id,
    );

    let answer_object = {
      question_id: question_id,
      answer: text,
    };

    filter_answers.push(answer_object);
    this.setState({table_answers: filter_answers, multipleAnswer: text});
  };

  updateMultipleImage = () => {
    let answers = this.state.table_answers;

    if (this.state.image !== null) {
      let file = {
        question_id: 'file',
        answer: `data:text/rtf;base64,${this.state.image.base64}`,
      };
      let filename = {
        question_id: 'filename',
        answer: this.state.image.fileName,
      };
      let description = {
        question_id: 'description',
        answer: this.state.multipleAnswer,
      };

      answers.push(file);
      answers.push(filename);
      answers.push(description);
      this.setState({table_answers: answers});
    } else {
      Alert.alert('Error', 'Please select an image to proceed');
    }
  };

  updateDropOption = (question_id, choice, type) => {
    let filter_answers = [];
    let answers = this.state.table_answers;

    if (type === 'vaccines') {
      filter_answers = answers.filter(
        (sitem) =>
          sitem.question_id !== 'vaccine_name' &&
          sitem.question_id !== 'vaccine_id',
      );

      filter_answers.push({
        question_id: 'vaccine_name',
        answer: choice.label,
      });
      filter_answers.push({
        question_id: 'vaccine_id',
        answer: parseInt(choice.value, 10),
      });
      this.setState({table_answers: filter_answers});
    } else {
      filter_answers = answers.filter(
        (sitem) => sitem.question_id !== question_id,
      );

      filter_answers.push({
        question_id: question_id,
        answer: choice,
      });
      this.setState({table_answers: filter_answers});
    }
  };

  addAnswers(question_id, text) {
    let update_answers = this.state.table_answers;
    let answer_object = {
      question_id: question_id,
      answer: text,
    };

    update_answers.push(answer_object);
    this.setState({table_answers: update_answers});
  }

  checkRequired(require) {
    if (require) {
      return ' *';
    }
    return '';
  }

  searchChangeText = (text, endpoint) => {
    if (text.length > 1 && endpoint !== 'vaccines') {
      this.setState({loading: true});

      if (this.state.loading) {
        withNetwork(
          () => {
            networkCall(
              endpoint + '/autocomplete.json?term=' + text.toLowerCase(),
              'GET',
            ).then((response) => {
              this.setState({
                facilityList: response.data,
                showList: true,
                loading: false,
              });
            });
          },
          (error) => {
            console.log(error);
          },
        );
      }
    } else if (text.length > 1 && endpoint === 'vaccines') {
      let vaccines = this.state.vaccines.filter((item) =>
        item.label.toLowerCase().includes(text),
      );

      this.setState({
        facilityList: vaccines,
        showList: true,
        loading: false,
      });
    } else {
      this.setState({facilityList: [], loading: false});
    }
  };

  dateMin(question_id, answer_linked, option) {
    if (
      (question_id === 'end_date' && answer_linked) ||
      (question_id === 'receipt_date' && answer_linked) ||
      (question_id === 'start_date' &&
        option[1] !== 'date_of_onset_of_reaction' &&
        answer_linked) ||
      (question_id === 'explant_date' && answer_linked)
    ) {
      return new Date(answer_linked);
    } else if (option[0] === 'min') {
      return new Date();
    }
    return new Date(moment().subtract(50, 'year').toDate());
  }

  selectPhotoTapped() {
    const options = {
      title: 'Documents/Pictures',
      mediaType: 'photo',
      includeBase64: true,
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        //("User cancelled photo picker");
      } else {
        this.setState({image: response.assets[0]});
      }
    });
  }

  render() {
    const {
      form = null,
      user = null,
      section = form.hasOwnProperty('section') ? form.section : null,
      required = form.hasOwnProperty('required') ? form.required : false,
      search = form.hasOwnProperty('search') ? form.search : null,
      search_url = form.hasOwnProperty('search_url') ? form.search_url : null,
      note=form.hasOwnProperty('note') ? form.note : null,
      question_id = form.question_id,
      question = form.question,
      answer_type = form.answer_type,
      subcounties = subcounties,
      table_form = form.hasOwnProperty('table_form') ? form.table_form : null,
      question_linked = form.hasOwnProperty('question_linked')
        ? form.question_linked
        : null,
      section_linked = form.hasOwnProperty('section_linked')
        ? form.section_linked
        : null,
      answer_linked = null,
      style = {},
      onChange = null,
      onAdd = null,
      onDelete = null,
      onChangeFacility = null,
      dropdownOption = null,
    } = this.props;

    let {answer = null, options = []} = this.props;
    if (user !== null && answer === null) {
      if (question_id === 'reporter_name' && user.name) {
        onChange('reporter_name', user.name);
        answer = user.name;
      } else if (question_id === 'reporter_email' && user.email) {
        onChange('reporter_email', user.email);
        answer = user.email;
      } else if (question_id === 'designation_id' && user.designation_id) {
        answer = user.designation_id;
        onChange('designation_id', user.designation_id);
      } else if (
        (question_id === 'reporter_phone' ||
          question_id === 'contact_number') &&
        user.phone_no
      ) {
        onChange(question_id, user.phone_no);
        answer = user.phone_no;
      }
    }

    let view;
    switch (answer_type) {
      case 'text':
      case 'numeric':
      case 'email-address':
      case 'phone-pad':
      default:
        view = (
          <View>
            {(question_linked === null ||
              (question_linked && answer_linked === '1') ||
              (question_linked && answer_linked === 'Yes') ||
              (section_linked && section_linked === answer_linked)) && (
              <>
                <TextInput
                  mode="outlined"
                  theme={theme}
                  value={answer}
                  placeholder={question + this.checkRequired(required)}
                  style={[styles.textInput, style]}
                  keyboardType={answer_type !== 'text' ? answer_type : 'default'}
                  returnKeyType="done"
                  onChangeText={(text) => {
                    onChange(question_id, text);
                    if (search) {
                      this.searchChangeText(text.toLowerCase(), search_url);
                    }
                  }}
                />
                {note && ( // Check if 'note' attribute exists
                  <Text style={styles.noteText}>{note}</Text>
                )}
              </>
            )}
            {search && this.state.showList && (
              <View style={styles.listFacilities}>
                {this.state.facilityList.length > 0 &&
                  this.state.facilityList.map((facility, index) => {
                    return (
                      <List.Item
                        key={index}
                        title={search === 'dynamic' ? facility : facility.label}
                        onPress={() => {
                          Keyboard.dismiss();
                          onChangeFacility(question_id, facility, search);
                          this.setState({showList: false});
                        }}
                      />
                    );
                  })}
                {note && ( // Check if 'note' attribute exists
                  <Text style={styles.noteText}>{note}</Text>
                )}
              </View>
            )}
          </View>
        );
        
        // view = (
        //   <View>
        //     {(question_linked === null ||
        //       (question_linked && answer_linked === '1') ||
        //       (question_linked && answer_linked === 'Yes') ||
        //       (section_linked && section_linked === answer_linked)) && (
        //       <TextInput
        //         mode="outlined"
        //         theme={theme}
        //         value={answer}
        //         placeholder={question + this.checkRequired(required)}
        //         style={[styles.textInput, style]}
        //         keyboardType={answer_type !== 'text' ? answer_type : 'default'}
        //         returnKeyType="done"
        //         onChangeText={(text) => {
        //           onChange(question_id, text);
        //           if (search) {
        //             this.searchChangeText(text.toLowerCase(), search_url);
        //           }
        //         }}
        //       />
        //     )}
        //     {search && this.state.showList && (
        //       <View style={styles.listFacilities}>
        //         {this.state.facilityList.length > 0 &&
        //           this.state.facilityList.map((facility, index) => {
        //             return (
        //               <List.Item
        //                 key={index}
        //                 title={search === 'dynamic' ? facility : facility.label}
        //                 onPress={() => {
        //                   Keyboard.dismiss();
        //                   onChangeFacility(question_id, facility, search);
        //                   this.setState({showList: false});
        //                 }}
        //               />
        //             );
        //           })}
        //       </View>
        //     )}
        //   </View>
        // );
        break;
      case 'multitext':
        view = (
          <View>
            <View style={styles.inline}>
              <TextInput
                mode="outlined"
                theme={theme}
                value={this.state.multipleAnswer}
                placeholder={question}
                style={styles.textInputMultiple}
                returnKeyType="done"
                onChangeText={(text) =>
                  this.updateAnswer(options[0].question_id, text)
                }
              />
              <Button
                mode="contained"
                style={styles.buttonAdd}
                labelStyle={styles.labelButton}
                onPress={() => {
                  if (this.state.table_answers.length > 0) {
                    Keyboard.dismiss();
                    onAdd(question_id, this.state.table_answers);
                    this.setState({multipleAnswer: '', table_answers: []});
                  }
                }}>
                Add
              </Button>
            </View>
            {answer &&
              answer.map((single_ans, index) => {
                if (single_ans.length > 0) {
                  return (
                    <List.Item
                      key={index}
                      title={single_ans[0].answer}
                      right={(props) => <List.Icon {...props} icon="delete" />}
                      onPress={() => {
                        let updatedAnswers = answer.filter(
                          (item, i) => i !== index,
                        );
                        onChange(question_id, updatedAnswers);
                      }}
                    />
                  );
                }
              })}
          </View>
        );
        break;

      case 'checkbox':
        if (this._isMounted && answer_type === 'checkbox' && answer === null) {
          onChange(question_id, '0');
        }

        view = (
          <View style={styles.viewCheckBox}>
            {(question_linked === null ||
              (question_linked && answer_linked === '1') ||
              (section_linked && section_linked === answer_linked)) && (
              <>
                {Platform.OS === 'ios' && answer === '0' && (
                  <Icon
                    name="checkbox-blank-outline"
                    type="MaterialCommunityIcons"
                    style={styles.iconCheckBox}
                    onPress={() => {
                      if (options && options.length === 0) {
                        let value = answer === '1' ? '0' : '1';
                        onChange(question_id, value);
                      }
                    }}
                  />
                )}
                {Platform.OS === 'ios' && answer === '1' && (
                  <Icon
                    name="checkbox-marked"
                    type="MaterialCommunityIcons"
                    style={styles.iconCheckBox}
                    onPress={() => {
                      if (options && options.length === 0) {
                        let value = answer === '1' ? '0' : '1';
                        onChange(question_id, value);
                      }
                    }}
                  />
                )}
                {Platform.OS === 'android' && (
                  <Checkbox
                    status={
                      answer === '1' ||
                      (options && options.length > 0 && answer)
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => {
                      if (options && options.length === 0) {
                        let value = answer === '1' ? '0' : '1';
                        onChange(question_id, value);
                      }
                    }}
                  />
                )}
              </>
            )}
          </View>
        );

        break;
      case 'radiobox':
        view = (question_linked === null ||
          (question_linked && answer_linked === '1') ||
          (question_linked &&
            question_linked !== 'device_availability' &&
            answer_linked === 'Yes') ||
          (question_linked &&
            question_linked === 'device_availability' &&
            answer_linked === 'No') ||
          (question_linked &&
            question_linked === 'serious' &&
            answer_linked === 'Serious') ||
          (question_linked && answer_linked === 'Female') ||
          (section_linked && section_linked === answer_linked)) && (
          <View style={options.length <= 3 ? styles.inline : styles.newline}>
            {options &&
              options.map((option, index) => {
                return (
                  <View style={styles.viewRadioBox} key={index}>
                    {Platform.OS === 'ios' && (
                      <>
                        <Text style={styles.textRadioBox}>{option.name}</Text>
                        {answer !== option.value && (
                          <Icon
                            name="radiobox-blank"
                            type="MaterialCommunityIcons"
                            style={styles.iconCheckBox}
                            onPress={() => {
                              onChange(question_id, option.value);
                            }}
                          />
                        )}

                        {answer === option.value && (
                          <Icon
                            name="radiobox-marked"
                            type="MaterialCommunityIcons"
                            style={styles.iconCheckBox}
                            onPress={() => {
                              onChange(question_id, option.value);
                            }}
                          />
                        )}
                      </>
                    )}
                    {Platform.OS === 'android' && (
                      <>
                        <RadioButton
                          status={
                            answer === option.value ? 'checked' : 'unchecked'
                          }
                          onPress={() => {
                            onChange(question_id, option.value);
                          }}
                        />
                        <Text style={styles.textRadioBox}>{option.name}</Text>
                      </>
                    )}

                    {option.hasOwnProperty('info') && (
                      <Icon
                        type={'Entypo'}
                        name={'info-with-circle'}
                        color={black}
                        style={[
                          styles.iconClose,
                          {marginLeft: moderateScale(15)},
                        ]}
                        onPress={() => Alert.alert(option.name, option.info)}
                      />
                    )}
                  </View>
                );
              })}
            <Text
              style={styles.textClear}
              onPress={() => {
                onDelete(question_id);
              }}>
              Clear
            </Text>
          </View>
        );

        break;
      case 'time':
      case 'date':
        let format =
          answer_type === 'time'
            ? moment(answer, 'HH:mm')
            : moment(answer, 'YYYY-MM-DD');
        let datetime = answer ? new Date(format) : new Date();
        let textDate = answer ? datetime : null;

        view = (section_linked === null ||
          (section_linked && section_linked === answer_linked)) && (
          <View style={styles.viewDate}>
            <Text style={styles.textDate} onPress={() => this.showCalender()}>
              {this.displayDate(textDate, answer_type)}
              <Text style={styles.textClickDate}>
                {' '}
                (Click to update)
                {'  '}
              </Text>
              <Text
                style={styles.textClear}
                onPress={() => {
                  onDelete(question_id);
                }}>
                Clear
              </Text>
            </Text>
            {this.state.showCalender && (
              <DateTimePicker
                value={datetime}
                mode={answer_type}
                minimumDate={this.dateMin(question_id, answer_linked, options)}
                maximumDate={
                  question_id === 'vaccination_date' && answer_linked
                    ? new Date(answer_linked)
                    : options[0] === 'max'
                    ? new Date()
                    : new Date(moment().add(50, 'year').toDate())
                }
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'compact' : 'spinner'}
                themeVariant="light"
                style={styles.datepickerView}
                onChange={(event, value) => {
                  this.setState(
                    {
                      showCalender: Platform.OS === 'android' ? false : true,
                    },
                    () =>
                      onChange(
                        question_id,
                        this.convertDate(value, answer_type),
                      ),
                  );
                }}
              />
            )}
          </View>
        );
        break;
      case 'table':
        view = (
          <View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalTable}
              onRequestClose={() => {
                this.setModalVisible();
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={[styles.inline, styles.modalViewInner]}>
                    <Icon
                      name={'close'}
                      color={black}
                      style={styles.iconClose}
                      onPress={this.setModalVisible}
                    />
                  </View>
                  {section && <Text style={styles.textSection}>{section}</Text>}
                  <KeyboardAvoidingView
                    keyboardVerticalOffset={moderateScale(-150)}
                    behavior={'height'}
                    style={styles.modalViewInner}>
                    <ScrollView
                      style={styles.modalScrollView}
                      keyboardShouldPersistTaps={'always'}
                      showsVerticalScrollIndicator={false}>
                      {table_form &&
                        table_form.map((item, index) => {
                          let answer_query = this.questionAnswer(
                            item.question_id,
                          );

                          let answer_query_linked = this.questionAnswer(
                            item.question_linked,
                          );

                          return (
                            <Question
                              key={index}
                              form={item}
                              answer={answer_query}
                              answer_linked={
                                answer_linked
                                  ? answer_linked
                                  : answer_query_linked
                              }
                              options={
                                item.hasOwnProperty('options')
                                  ? Array.isArray(item.options)
                                    ? item.options
                                    : this.state[item.options]
                                  : []
                              }
                              onChange={this.updateAnswer}
                              onChangeFacility={this.updateDropOption}
                              dropdownOption={'alt'}
                            />
                          );
                        })}

                      <Button
                        style={styles.buttonSubmit}
                        labelStyle={styles.labelButton}
                        onPress={() => {
                          let validation_check = this.tableValidation(
                            section,
                            table_form,
                          );
                          if (validation_check) {
                            onAdd(question_id, this.state.table_answers).then(
                              () => {
                                this.setState({
                                  multipleAnswer: null,
                                  table_answers: [],
                                });
                              },
                            );
                          }
                        }}>
                        Submit
                      </Button>
                    </ScrollView>
                  </KeyboardAvoidingView>
                </View>
              </View>
            </Modal>

            <Button
              mode="contained"
              style={styles.buttonAdd}
              labelStyle={styles.labelButton}
              onPress={() => {
                this.setState({table_answers: [], multipleAnswer: null});
                this.setModalVisible();
              }}>
              Add
            </Button>
            <Text style={styles.textTable}>
              Scroll horizontally to view the table
            </Text>
            <ScrollView horizontal>
              <DataTable>
                {options.length > 0 && this.header(form.headers, options)}

                {answer &&
                  answer.length > 0 &&
                  this.rows(answer, table_form, question_id, onChange)}

                <DataTable.Pagination
                  page={0}
                  numberOfPages={3}
                  onPageChange={(page) => {}}
                  label={answer ? 'Total : ' + answer.length : 'Total : ' + 0}
                  numberOfItemsPerPage={1}
                  showFastPagination
                />
              </DataTable>
            </ScrollView>
          </View>
        );
        break;
      case 'dropdown':
        if (
          question_linked === 'county_id' ||
          question_linked === 'patient_county'
        ) {
          options = subcounties.filter(
            (item) => item.link_id !== null && item.link_id === answer_linked,
          );
        }
        if (!dropdownOption && options) {
          view = (
            <View>
              {(question_linked === null ||
                question_linked === 'county_id' ||
                question_linked === 'patient_county' ||
                (question_linked && answer_linked === '1') ||
                answer_linked === 'Yes' ||
                (section_linked && section_linked === answer_linked)) && (
                <DropDown
                  label={question + this.checkRequired(required)}
                  mode={'outlined'}
                  visible={this.state.dropdownStatus}
                  showDropDown={() => this.openCloseMenu()}
                  onDismiss={() => this.openCloseMenu()}
                  value={answer ? answer : ''}
                  setValue={(value) => onChange(question_id, value)}
                  list={options}
                />
              )}
            </View>
          );
        } else if (options) {
          view = (
            <ModalSelector
              data={options}
              initValue={question}
              onChange={(option) => {
                onChange(question_id, option.value);
              }}
              style={styles.dropdownButton}
              initValueTextStyle={{color: accent}}
              selectStyle={styles.dropdownContainer}
              optionContainerStyle={styles.optContainer}
              searchStyle={styles.searchStyle}
              cancelContainerStyle={{backgroundColor: accent}}
            />
          );
        }
        break;
      case 'multiple_image':
        view = (
          <View>
            <Text
              style={{
                marginTop: moderateScale(5),
                marginRight: moderateScale(10),
              }}>
              Click icon to add photo
            </Text>
            <View style={styles.inline}>
              <TouchableOpacity onPress={() => this.selectPhotoTapped()}>
                {this.state.image === null ? (
                  <Icon name="camera" style={styles.iconCamera} />
                ) : (
                  <Image
                    style={styles.imageThumbnail}
                    source={{
                      uri: `data:text/rtf;base64,${this.state.image.base64}`,
                    }}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
              <TextInput
                mode="outlined"
                theme={theme}
                value={this.state.multipleAnswer}
                placeholder={question}
                style={styles.textInputImage}
                returnKeyType="done"
                onChangeText={(text) => this.setState({multipleAnswer: text})}
              />
              <Button
                mode="contained"
                style={styles.buttonAdd}
                labelStyle={styles.labelButton}
                onPress={() => {
                  this.updateMultipleImage();
                  if (this.state.table_answers.length > 0) {
                    Keyboard.dismiss();
                    onAdd(question_id, this.state.table_answers).then(() => {
                      this.setState({
                        multipleAnswer: null,
                        table_answers: [],
                        image: null,
                      });
                    });
                  }
                }}>
                Add
              </Button>
            </View>

            {answer &&
              answer.map((single_ans, index) => {
                if (single_ans.length > 0) {
                  return (
                    <View key={index} style={styles.inline}>
                      <Image
                        style={styles.imageMultiple}
                        source={{uri: single_ans[0].answer}}
                      />
                      <Text style={styles.textInputImage}>
                        {single_ans[2].answer}
                      </Text>
                      <Icon
                        name="delete"
                        style={styles.iconCamera}
                        onPress={() => {
                          let updatedAnswers = answer.filter(
                            (item, i) => i !== index,
                          );
                          onChange(question_id, updatedAnswers);
                        }}
                      />
                    </View>
                  );
                }
              })}
          </View>
        );
        break;
    }
    return (
      <View style={styles.newline}>
        {section && <Text style={styles.textSection}>{section}</Text>}
        <View
          style={answer_type === 'checkbox' ? styles.inline : styles.newline}>
          {(section_linked === null ||
            (section_linked && section_linked === answer_linked)) &&
            question !== '' && (
              <Text style={styles.textQuestion}>
                {question + this.checkRequired(required)}
              </Text>
            )}
          {view}
        </View>
      </View>
    );
  }
}
Question.propTypes = {
  section: PropTypes.string,
  question_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  question: PropTypes.string,
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  answer: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
  ]),
  answer_type: PropTypes.oneOf([
    'text',
    'numeric',
    'email-address',
    'phone-pad',
    'checkbox',
    'number',
    'radiobox',
    'table',
    'date',
    'time',
    'dropdown',
    'multitext',
    'multiple_image',
  ]),
};

const styles = StyleSheet.create({
  newline: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  viewRadioBox: {
    minWidth: moderateScale(90),
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(5),
    marginLeft: moderateScale(10),
  },
  viewCheckBox: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDate: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  headerTable: {
    width: moderateScale(100),
    marginRight: moderateScale(10),
  },
  textSection: {
    color: black,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginTop: moderateScale(15),
    marginBottom: moderateScale(5),
  },
  textQuestion: {
    color: black,
    fontSize: moderateScale(14),
    marginTop: moderateScale(10),
  },
  textRadioBox: {
    color: black,
    fontSize: moderateScale(14),
  },
  textDate: {
    color: black,
    fontWeight: 'bold',
    marginLeft: moderateScale(10),
    fontSize: moderateScale(14),
    marginTop: moderateScale(10),
  },
  textClickDate: {
    fontWeight: 'normal',
    fontSize: moderateScale(12),
  },
  textInput: {
    marginTop: moderateScale(5),
    height: moderateScale(45),
  },
  textInputMultiple: {
    marginRight: moderateScale(10),
    height: moderateScale(45),
  },
  textInputImage: {
    marginRight: moderateScale(10),
    height: moderateScale(45),
    width: '50%',
  },
  buttonAdd: {
    justifyContent: 'center',
    backgroundColor: accent,
    alignSelf: 'flex-end',
  },
  buttonDelete: {
    justifyContent: 'center',
    backgroundColor: 'red',
    alignSelf: 'flex-start',
  },
  buttonSubmit: {
    justifyContent: 'center',
    backgroundColor: green,
    alignSelf: 'center',
    marginTop: moderateScale(20),
  },
  labelButton: {
    color: 'white',
    fontSize: moderateScale(12),
  },
  textTable: {
    fontSize: moderateScale(10),
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: moderateScale(20),
    width: '95%',
    minHeight: moderateScale(400),
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    padding: moderateScale(35),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScrollView: {
    height: '80%',
    marginBottom: moderateScale(15),
  },
  modalViewInner: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  iconClose: {
    alignSelf: 'flex-end',
  },
  dropdownButton: {
    marginTop: moderateScale(10),
  },
  dropdownContainer: {
    height: moderateScale(50),
    justifyContent: 'center',
    borderColor: 'grey',
  },
  searchStyle: {
    color: 'black',
  },
  optContainer: {
    backgroundColor: 'white',
  },
  require: {
    fontSize: moderateScale(14),
    color: 'red',
  },
  datepickerView: {
    width: '40%',
    justifyContent: 'center',
    // backgroundColor: 'white',
  },
  textClear: {
    marginLeft: moderateScale(5),
    fontSize: moderateScale(14),
    textDecorationLine: 'underline',
    fontStyle: 'italic',
    color: 'blue',
  },
  listFacilities: {
    elevation: 3,
    borderColor: 'grey',
    borderRadius: moderateScale(0.5),
    backgroundColor: 'white',
  },
  noteText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  imageThumbnail: {
    height: moderateScale(50),
    width: moderateScale(50),
    resizeMode: 'contain',
  },
  imageMultiple: {
    marginVertical: moderateScale(5),
    height: moderateScale(70),
    width: moderateScale(70),
    resizeMode: 'contain',
  },
  iconCamera: {
    fontSize: moderateScale(30),
    marginRight: moderateScale(30),
    color: accent,
  },
  iconCheckBox: {
    fontSize: moderateScale(25),
    marginLeft: moderateScale(15),
    color: accent,
  },
});

export default Question;

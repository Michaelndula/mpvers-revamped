import React from 'react';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import {Checkbox, DataTable} from 'react-native-paper';
import PropTypes from 'prop-types';
import {moderateScale} from 'react-native-size-matters';
import {black, light_grey} from '../../utilities/colors';
import {BASE_URL} from '../../services/network';

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

    this.state = {};
  }

  tableRowOrder(tableForm, formAnswers, vaccines) {
    let filteredAnswers = [];
    tableForm.map((formItem) => {
      if (formItem.question_id === 'vaccine_name') {
        let vac = vaccines
          .filter(
            (item) =>
              formAnswers.vaccine_id !== null &&
              item.value === formAnswers.vaccine_id.toString(),
          )
          .map((item) => item.label);
        if (vac.length > 0) {
          filteredAnswers.push(vac);
        } else {
          filteredAnswers.push(formAnswers.vaccine_name);
        }
      } else if (formItem.question_id === 'suspected_drug') {
        if (formAnswers[formItem.question_id] === '1') {
          filteredAnswers.push('suspected');
        } else {
          filteredAnswers.push('not suspected');
        }
      } else if (formItem.question_id === 'vaccination_time') {
        let time =
          formAnswers[formItem.question_id].hour +
          ':' +
          formAnswers[formItem.question_id].min;
        filteredAnswers.push(time);
      } else {
        if (typeof formAnswers[formItem.question_id] !== 'object') {
          filteredAnswers.push(formAnswers[formItem.question_id]);
        }
      }
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

  rows(rowItems, table_form, vaccines) {
    let view = [];
    for (let i = 0; i < rowItems.length; i++) {
      let newAnswerList = this.tableRowOrder(table_form, rowItems[i], vaccines);
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
            {' '}
          </DataTable.Cell>
        </DataTable.Row>,
      );
    }
    return view;
  }

  render() {
    const {
      form = null,
      section = form.hasOwnProperty('section') ? form.section : null,
      vaccines = vaccines,
      question = form.question,
      answer = null,
      answer_type = form.answer_type,
      options = [],
      table_form = form.hasOwnProperty('table_form') ? form.table_form : null,
    } = this.props;

    let view;
    switch (answer_type) {
      default:
        view = (
          <View style={styles.viewTextAnswer}>
            <Text style={styles.textAnswer}>{answer}</Text>
          </View>
        );
        break;
      case 'checkbox':
        view = (
          <View style={styles.viewCheckBox}>
            <Checkbox status={answer === '1' ? 'checked' : 'unchecked'} />
          </View>
        );

        break;
      case 'multitext':
        view =
          answer &&
          answer.map((single_ans, index) => {
            return (
              <View key={index} style={styles.viewTextAnswer}>
                <Text style={styles.textAnswer}>{single_ans.description}</Text>
              </View>
            );
          });
        break;
      case 'multiple_image':
        view =
          answer &&
          answer.map((ans, index) => {
            return (
              <View key={index} style={styles.inline}>
                <Image
                  style={styles.imageMultiple}
                  source={{uri: `${BASE_URL}/attachments/download/${ans.id}`}}
                />
                <Text style={styles.textInputImage}>{ans.description}</Text>
              </View>
            );
          });

        break;
      case 'table':
        view = (
          <View>
            <Text style={styles.textTable}>
              Scroll horizontally to view the table
            </Text>
            <ScrollView horizontal>
              <DataTable>
                {options &&
                  this.header(Object.keys(options[0]).length, options)}

                {answer &&
                  answer.length > 0 &&
                  this.rows(answer, table_form, vaccines)}

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
    }

    return (
      <View style={styles.newline}>
        {section && <Text style={styles.textSection}>{section}</Text>}
        {answer !== null && (
          <View
            style={answer_type === 'checkbox' ? styles.inline : styles.newline}>
            <Text style={styles.textQuestion}>{question}</Text>
            {view}
          </View>
        )}
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
  },
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  viewCheckBox: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTable: {
    width: moderateScale(100),
    marginRight: moderateScale(10),
  },
  textSection: {
    color: black,
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    marginTop: moderateScale(15),
    marginBottom: moderateScale(5),
  },
  textQuestion: {
    color: black,
    fontSize: moderateScale(16),
  },
  viewTextAnswer: {
    borderColor: 'black',
    height: moderateScale(45),
    marginVertical: moderateScale(10),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(0.5),
    backgroundColor: light_grey,
    justifyContent: 'center',
  },
  textAnswer: {
    color: black,
    fontSize: moderateScale(14),
    marginLeft: moderateScale(15),
  },
  textTable: {
    fontSize: moderateScale(10),
  },
  textInputImage: {
    marginRight: moderateScale(10),
    height: moderateScale(45),
    width: '60%',
  },
  imageMultiple: {
    marginVertical: moderateScale(5),
    height: moderateScale(70),
    width: moderateScale(70),
    resizeMode: 'contain',
  },
});
export default Question;

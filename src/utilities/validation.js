import moment from 'moment';
import {Alert} from 'react-native';
import { aefi, transfusion, medication, device, pqmp, sadr } from './colors';
 

export const sortKeyValue = (data) => {
  let cleanData = [];

  for (const key in data) {
    if (data[key]) {
      cleanData.push({value: key, label: data[key]});
    }
  }

  cleanData.sort((a, b) => a.label.toString().localeCompare(b.label));
  return cleanData;
};

export const sortLinkedData = (data) => {
  let cleanData = [];

  data.map((item) => {
    if (item.sub_county_name) {
      cleanData.push({
        value: item.id,
        label: item.sub_county_name,
        link_id: item.county_id,
      });
    }
  });

  cleanData.sort((a, b) => a.label.toString().localeCompare(b.label));
  return cleanData;
};

export const generateInitialForm = (complete_form, answers, form_type) => {
  let form = {};
  let form_complete = {};
  const form_id = [form_type] + '_id';

  Object.assign(form, {[form_id]: null});
  Object.assign(form, {report_type: 'Intitial'});
  Object.assign(form, {submitted: '2'});
  Object.assign(form, {device: '1'});
  Object.assign(form, {complaint: ''});

  answers.map((question) => {
    if (Array.isArray(question.answer)) {
      if (
        [question.question_id].toString() === 'AefiListOfVaccine' ||
        [question.question_id].toString() === 'PadrListOfMedicine' ||
        [question.question_id].toString() === 'SadrListOfDrug' ||
        [question.question_id].toString() === 'SadrListOfMedicine' ||
        [question.question_id].toString() === 'ListOfDevice' ||
        [question.question_id].toString() === 'MedicationProduct' ||
        [question.question_id].toString() === 'Pint' ||
        [question.question_id].toString() === 'Attachment'
      ) {
        let arr = [];
        for (let i = 0; i < question.answer.length; i++) {
          let newObj = {};
          if ([question.question_id].toString() === 'AefiListOfVaccine') {
            Object.assign(newObj, {suspected_drug: null});
          }
          question.answer[i].map((item) => {
            if ([item.question_id].toString() === 'vaccination_time') {
              Object.assign(newObj, {
                [item.question_id]: dateTimeFormat(
                  item.answer,
                  'singular_time',
                ),
              });
            } else {
              Object.assign(newObj, {[item.question_id]: item.answer});
            }
          });

          arr.push(newObj);
        }
        Object.assign(form_complete, {[question.question_id]: arr});
      } else if (
        [question.question_id].toString() === 'AefiDescription' ||
        [question.question_id].toString() === 'SadrDescription'
      ) {
        let arr = [];
        for (let i = 0; i < question.answer.length; i++) {
          let newObj = {};
          question.answer[i].map((item) => {
            Object.assign(newObj, {[item.question_id]: item.answer});
          });
          arr.push(newObj);
        }
        Object.assign(form_complete, {[question.question_id]: arr});
      }
    } else if (
      ([question.question_id].toString() === 'date_of_birth' &&
        form_type === 'padr') ||
      ([question.question_id].toString() === 'date_of_birth' &&
        form_type === 'aefi') ||
      ([question.question_id].toString() === 'date_of_birth' &&
        form_type === 'pqmp') ||
      ([question.question_id].toString() === 'date_of_birth' &&
        form_type === 'sadr') ||
      ([question.question_id].toString() === 'manufacture_date' &&
        form_type === 'pqmp') ||
      [question.question_id].toString() === 'date_of_onset_of_reaction'
    ) {
      Object.assign(form, {
        [question.question_id]: dateTimeFormat(
          question.answer,
          'singular_date',
        ),
      });
    } else if (
      [question.question_id].toString() === 'time_aefi_started' ||
      ([question.question_id].toString() === 'time_of_event' &&
        form_type === 'medication')
    ) {
      Object.assign(form, {
        [question.question_id]: dateTimeFormat(
          question.answer,
          'singular_time',
        ),
      });
    } else {
      Object.assign(form, {[question.question_id]: question.answer});
    }
  });

  for (var i = 0; i < complete_form.length; i++) {
    const answer_check = answers.filter(
      (ansItem) => ansItem.question_id === complete_form[i].question_id,
    );

    if (complete_form[i].required === true && answer_check.length < 1) {
      Alert.alert('Error ', complete_form[i].question + ' data is required');
      return null;
    }
  }

  Object.assign(form_complete, {[capitalizeFirstLetter(form_type)]: form});

  return form_complete;
};

export const generateFollowUpForm = (form_complete, answers, form_type) => {
  form_complete[capitalizeFirstLetter(form_type)].report_type = 'FollowUp';
  form_complete[capitalizeFirstLetter(form_type)].complaint = '';

  answers.map((question) => {
    if (Array.isArray(question.answer)) {
      if (
        [question.question_id].toString() === 'AefiListOfVaccine' ||
        [question.question_id].toString() === 'PadrListOfMedicine' ||
        [question.question_id].toString() === 'SadrListOfDrug' ||
        [question.question_id].toString() === 'SadrListOfMedicine' ||
        [question.question_id].toString() === 'ListOfDevice' ||
        [question.question_id].toString() === 'MedicationProduct' ||
        [question.question_id].toString() === 'Pint' ||
        [question.question_id].toString() === 'AefiDescription' ||
        [question.question_id].toString() === 'SadrDescription' ||
        [question.question_id].toString() === 'Attachment'
      ) {
        let arr = [];
        for (let i = 0; i < question.answer.length; i++) {
          let newObj = {};
          if ([question.question_id].toString() === 'AefiListOfVaccine') {
            Object.assign(newObj, {suspected_drug: null});
          }
          question.answer[i].map((item) => {
            if ([item.question_id].toString() === 'vaccination_time') {
              Object.assign(newObj, {
                [item.question_id]: dateTimeFormat(
                  item.answer,
                  'singular_time',
                ),
              });
            } else {
              Object.assign(newObj, {[item.question_id]: item.answer});
            }
          });

          arr.push(newObj);
        }
        Object.assign(form_complete, {[question.question_id]: arr});
      }
    } else if (
      [question.question_id].toString() === 'time_of_event' &&
      form_type === 'medication'
    ) {
      form_complete[capitalizeFirstLetter(form_type)][question.question_id] =
        dateTimeFormat(question.answer, 'singular_time');
    } else {
      form_complete[capitalizeFirstLetter(form_type)][question.question_id] =
        question.answer;
    }
  });

  delete form_complete[capitalizeFirstLetter(form_type)].id;
  delete form_complete.AefiOriginal;
  delete form_complete.SadrOriginal;
  delete form_complete.DeviceOriginal;
  delete form_complete.MedicationOriginal;
  delete form_complete.TransfusionOriginal;
  delete form_complete.County;
  delete form_complete.SubCounty;
  delete form_complete.Designation;
  delete form_complete.ExternalComment;

  return form_complete;
};

export const checkSectionRequired = (complete_form, answers) => {
  let validate = complete_form
    .filter((item) => item.required)
    .map((form) => {
      return form;
    });

  for (let i = 0; i < validate.length; i++) {
    if (answers.length > 0) {
      const answer_check = answers.filter(
        (ansItem) => ansItem.question_id === validate[i].question_id,
      );

      if (answer_check.length < 1) {
        Alert.alert(
          'Missing Field',
          validate[i].question + ' data is required',
        );
        return true;
      }
    } else {
      Alert.alert(
        'Missing Data Fields',
        'Please answer all the mandatory fields to proceed',
      );
      return true;
    }
  }
  return false;
};

export const dateTimeFormat = (datetime, type) => {
  let date = datetime;
  if (type === 'singular_date') {
    date = {
      day: moment(datetime).format('DD'),
      month: moment(datetime).format('MM'),
      year: moment(datetime).format('YYYY'),
    };
  } else if (type === 'singular_time') {
    const [hour, min] = datetime.split(':');
    date = {
      hour: hour,
      min: min,
    };
  }

  return date;
};

export const capitalizeFirstLetter = (string) => {
  if (string || string !== undefined) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

export const setBackground = (type) => {
  let color = aefi;
  switch (type) {
    case 'transfusion':
      color = transfusion;
      break;
    case 'medication':
      color = medication;
      break;
    case 'device':
      color = device;
      break;
    case 'pqmp':
      color = pqmp;
      break;
    case 'sadr':
      color = sadr;
      break;
    case 'aefi':
    default:
      color = aefi;
      break;
  }
  return color;
};

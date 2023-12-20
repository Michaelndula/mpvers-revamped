import {Alert} from 'react-native';

export const validateSADR = (answers, section_id) => {
  if (answers.length > 0) {
    if (section_id === 1) {
      let check = answers.filter(
        (ansItem) =>
          (ansItem.answer === '1' && ansItem.question_id === 'report_sadr') ||
          (ansItem.answer === '1' &&
            ansItem.question_id === 'report_therapeutic'),
      );
      if (check.length < 1) {
        Alert.alert(
          'Report on Required',
          'At least one option is required for report on',
        );
        return true;
      }

      let category_check = answers.filter(
        (ansItem) =>
          (ansItem.answer === '1' &&
            ansItem.question_id === 'medicinal_product') ||
          (ansItem.answer === '1' &&
            ansItem.question_id === 'herbal_product') ||
          (ansItem.answer === '1' &&
            ansItem.question_id === 'cosmeceuticals') ||
          (ansItem.answer === '1' && ansItem.question_id === 'product_other'),
      );
      if (category_check.length < 1) {
        Alert.alert(
          'Product Category Required',
          'At least one product category is required',
        );
        return true;
      }
    }
  }
};

export const validateAEFI = (answers, section_id) => {
  if (answers.length > 0) {
    if (section_id === 1) {
      let check = answers.filter((ansItem) => ansItem.answer === '1');
      if (check.length < 1) {
        Alert.alert('Complaint Required', 'At least one complaint is required');
        return true;
      }
    }
  }
};

export const validateDevice = (answers, section_id) => {
  if (section_id === 2) {
    let check = answers.filter(
      (ansItem) =>
        ansItem.question_id === 'date_of_birth' ||
        ansItem.question_id === 'age_years',
    );
    if (check.length < 1) {
      Alert.alert(
        'Age Required',
        'Either date of birth or age group is required',
      );
      return true;
    }
  }
};

export const validateMedication = (answers, section_id) => {
  if (section_id === 2) {
    let check = answers.filter(
      (ansItem) =>
        ansItem.question_id === 'date_of_birth' ||
        ansItem.question_id === 'age_years',
    );
    if (check.length < 1) {
      Alert.alert(
        'Age Required',
        'Either date of birth or age group is required',
      );
      return true;
    }
  }
};

export const validateTransfusion = (answers, section_id) => {
  if (section_id === 1) {
    let check = answers.filter(
      (ansItem) =>
        ansItem.question_id === 'date_of_birth' ||
        ansItem.question_id === 'age_years',
    );
    if (check.length < 1) {
      Alert.alert(
        'Age Required',
        'Either date of birth or age group is required',
      );
      return true;
    }
  }
};

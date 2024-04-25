import {Alert} from 'react-native';

export const validateReporter = (answers) => {
  let check = answers.filter(
    (ansItem) =>
      ansItem.question_id === 'person_submitting' && ansItem.answer === 'Yes',
  );
  if (check.length === 1) {
    let check_name = answers.filter(
      (ansItem) => ansItem.question_id === 'reporter_name_diff',
    );
    let check_email = answers.filter(
      (ansItem) => ansItem.question_id === 'reporter_email_diff',
    );
    let check_desgn = answers.filter(
      (ansItem) => ansItem.question_id === 'reporter_designation_diff',
    );
    if (check_name < 1) {
      Alert.alert('Reporter Details', 'Reporter name is are required');
      return false;
    }
    if (check_email < 1) {
      Alert.alert('Reporter Details', 'Reporter email is are required');
      return false;
    }
    if (check_desgn < 1) {
      Alert.alert('Reporter Details', 'Reporter designation is are required');
      return false;
    }
  }
  return true;
};

export const validateSADR = (answers, section_id) => {
  if (answers.length > 0) {
    if (section_id === 1) {
      let check = answers.filter(
        (ansItem) =>
          (ansItem.answer === '1' && ansItem.question_id === 'report_sadr') ||
          (ansItem.answer === '1' &&
            ansItem.question_id === 'report_therapeutic') ||
            (ansItem.answer === '1' &&
            ansItem.question_id === 'report_misuse')||
            (ansItem.answer === '1' &&
            ansItem.question_id === 'report_off_label'),
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

    if (section_id === 3) {
      let check = answers.filter(
        (ansItem) =>
          ansItem.question_id === 'date_of_birth' ||
          ansItem.question_id === 'age_group',
      );
      if (check.length < 1) {
        Alert.alert(
          'Age Required',
          'Either date of birth or age group is required',
        );
        return true;
      }
    }
  }
};

export const validateAEFI = (answers, section_id) => {
  if (answers.length > 0) {
    if (section_id === 3) {
      let check = answers.filter((ansItem) => ansItem.answer === '1');
      if (check.length < 1) {
        Alert.alert('Complaint Required', 'At least one complaint is required');
        return true;
      }
    }

    if (section_id === 2) {
      let check = answers.filter(
        (ansItem) =>
          ansItem.question_id === 'date_of_birth' ||
          ansItem.question_id === 'age_months',
      );
      if (check.length < 1) {
        Alert.alert(
          'Age Required',
          'Either date of birth or age in months is required',
        );
        return true;
      }
    }
  }
};

export const validatePADR = (answers, section_id) => {
  if (section_id === 2) {
    let check = answers.filter(
      (ansItem) =>
        ansItem.question_id === 'date_of_birth' ||
        ansItem.question_id === 'age_group',
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

export const validatePQHPT = (answers, section_id) => {
  if (answers.length > 0) {
    if (section_id === 6) {
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

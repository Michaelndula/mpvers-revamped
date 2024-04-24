import {aefi} from './aefi';
import {sadr} from './sadr';
import {device} from './device';
import {medication} from './medication';
import {transfusion} from './transfusion';

export const setForm = (type) => {
  if (type === 'aefi') {
    return aefi;
  } else if (type === 'sadr') {
    return sadr;
  } else if (type === 'device') {
    return device;
  } else if (type === 'medication') {
    return medication;
  } else if (type === 'transfusion') {
    return transfusion;
  }
};

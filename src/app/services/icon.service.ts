import { Injectable } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cubeOutline,
  swapHorizontalOutline,
  peopleOutline,
  constructOutline,
  documentTextOutline,
  personAddOutline,
  keyOutline,
  logInOutline,
  logOutOutline,
  createOutline,
  trashOutline,
  shieldCheckmarkOutline,
  notificationsOutline,
  alertCircleOutline,
  chevronDownOutline,
  listOutline,
  addCircleOutline,
  pricetagOutline
} from 'ionicons/icons';
@Injectable({ providedIn: 'root' })
export class IconService {
  constructor() {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'cube-outline': cubeOutline,
      'swap-horizontal-outline': swapHorizontalOutline,
      'people-outline': peopleOutline,
      'construct-outline': constructOutline,
      'document-text-outline': documentTextOutline,
      'person-add-outline': personAddOutline,
      'key-outline': keyOutline,
      'log-in-outline': logInOutline,
      'log-out-outline': logOutOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'notifications-outline': notificationsOutline,
      'alert-circle-outline': alertCircleOutline,
      'chevron-down-outline': chevronDownOutline,
      'list-outline': listOutline,
      'add-circle-outline': addCircleOutline,
      'pricetag-outline': pricetagOutline
    });
  }
}

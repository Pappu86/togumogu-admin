import {
  add,
  sub,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';

// export function camel (str) {
//   const camel = (str || '').replace(/-([^-])/g, g => g[1].toUpperCase());

//   return capitalize(camel);
// }

// export function camelActual (str) {
//   return (str || '').replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
// }

// export function kebab (str) {
//   return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
// }

export function capitalize(str) {
  str = str || '';

  return str.replace(/\w\S*/g, function (word) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
}

// export function findProduct (store, id) {
//   return store.state.store.products.find(p => p.id === id);
// }

// export function isOnSale (variants) {
//   return variants.some(variant => {
//     return parseFloat(variant.price) < parseFloat(variant.compareAtPrice);
//   });
// }

// export function randomNumber (min, max) {
//   return Math.floor(Math.random() * max) + min;
// }

// export function randomString (length = 5) {
//   let text = '';
//   const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//   for (let i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }

//   return text;
// }

export function uuid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const randomElement = (arr = []) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export function humanReadableFileSize(bytes, binary = false) {
  const base = binary ? 1024 : 1000;
  if (bytes < base) {
    return `${bytes} B`;
  }

  const prefix = binary ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G'];
  let unit = -1;
  while (Math.abs(bytes) >= base && unit < prefix.length - 1) {
    bytes /= base;
    ++unit;
  }
  return `${bytes.toFixed(1)} ${prefix[unit]}B`;
}

const kebab = (str) => {
  return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const getArrayList = (context, itemsList, options) => {
  const newItems = [];
  itemsList.forEach((element) => {
    newItems.push(element[context]);
  });

  return newItems;
};

export const getAvailableDateRange = (ranges) => {
  if (!(ranges && ranges.length))
    ranges = [
      'today',
      'yesterday',
      'last_seven_days',
      'last_thirty_days',
      'this_month',
      'last_month',
      'this_year',
      'last_year',
    ];
  const rangesList = {
    today: [getDateOfStartOrEnd('start'), getDateOfStartOrEnd('end')],
    tomorrow: [
      getDateOfStartOrEnd('start', 'add', { days: 1 }),
      getDateOfStartOrEnd('end', 'add', { days: 1 }),
    ],
    yesterday: [
      getDateOfStartOrEnd('start', 'subtract', { days: 1 }),
      getDateOfStartOrEnd('end', 'subtract', { days: 1 }),
    ],
    next_seven_days: [
      getDateOfStartOrEnd('start'),
      getDateOfStartOrEnd('end', 'add', { days: 6 }),
    ],
    last_seven_days: [
      getDateOfStartOrEnd('start', 'subtract', { days: 6 }),
      getDateOfStartOrEnd('end'),
    ],
    last_thirty_days: [
      getDateOfStartOrEnd('start', 'subtract', { days: 29 }),
      getDateOfStartOrEnd('end'),
    ],
    next_thirty_days: [
      getDateOfStartOrEnd('start'),
      getDateOfStartOrEnd('end', 'add', { days: 29 }),
    ],
    this_week: [
      getDateOfStartOrEnd('start', null, 'week', true),
      getDateOfStartOrEnd('end', null, 'week', true),
    ],
    this_month: [
      getDateOfStartOrEnd('start', null, 'month', true),
      getDateOfStartOrEnd('end', null, 'month', true),
    ],
    last_month: [
      getDateOfStartOrEnd('start', 'subtract', { months: 1 }),
      getDateOfStartOrEnd('end', 'subtract', { months: 1 }),
    ],
    next_three_month: [
      getDateOfStartOrEnd('start'),
      getDateOfStartOrEnd('end', 'add', { months: 3 }),
    ],
    next_four_month: [
      getDateOfStartOrEnd('start'),
      getDateOfStartOrEnd('end', 'add', { months: 4 }),
    ],
    this_year: [
      getDateOfStartOrEnd('start', null, 'year', true),
      getDateOfStartOrEnd('end', null, 'year', true),
    ],
    last_year: [
      getDateOfStartOrEnd('start', 'subtract', { years: 1 }),
      getDateOfStartOrEnd('end', 'subtract', { years: 1 }),
    ],
    next_year: [
      getDateOfStartOrEnd('start', 'add', { years: 1 }),
      getDateOfStartOrEnd('end', 'add', { years: 1 }),
    ],
    all: ['', ''],
  };

  // Picking selected ranges
  const availableRanges = ranges.reduce((result, key) => {
    result[key] = rangesList[key];
    return result;
  }, {});

  return availableRanges;
};

// Get date range for filter
export const getDateOfStartOrEnd = (
  startOrEnd,
  addOrSubtract,
  addOrSubValue,
  isUnitStartOrEnd,
  date,
  customFormat = 'yyyy-MM-dd HH:mm:ss'
) => {
  let now = new Date();
  if (date) {
    now = new Date(date);
  }

  if (isUnitStartOrEnd) {
    if (addOrSubValue === 'week') {
      // set end of week value
      if (startOrEnd === 'start') return format(startOfWeek(now), customFormat);
      else if (startOrEnd === 'end')
        return format(endOfWeek(now), customFormat);
    }

    if (addOrSubValue === 'month') {
      // set end of month value
      if (startOrEnd === 'start')
        return format(startOfMonth(now), customFormat);
      else if (startOrEnd === 'end')
        return format(endOfMonth(now), customFormat);
    }

    if (addOrSubValue === 'year') {
      // set end of year value
      if (startOrEnd === 'start') return format(startOfYear(now), customFormat);
      else if (startOrEnd === 'end')
        return format(endOfYear(now), customFormat);
    }
  } else {
    if (addOrSubtract === 'add') now = add(now, addOrSubValue);
    else if (addOrSubtract === 'subtract') now = sub(now, addOrSubValue);

    // set end of days value
    if (startOrEnd === 'start') {
      return format(startOfDay(now), customFormat);
    } else if (startOrEnd === 'end') {
      return format(endOfDay(now), customFormat);
    }
  }
};

export const csvDownload = (fileName, headers, data) => {
  const csvKeys = headers.map((keyObj) => keyObj.key);
  let headerStr = '';
  headers.forEach(
    (obj, index) =>
      (headerStr += `${obj.text}${headers.length - 1 !== index ? ',' : ''}`)
  );

  let csvContent = `${headerStr}\n`;
  csvContent += convertToCSV(data, csvKeys);

  const anchor = document.createElement('a');
  anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  anchor.target = '_blank';
  anchor.download = `${fileName || 'export'}.csv`;
  anchor.click();
  return true;
};

export const csvFileToJSON = (file) => {
  if (
    file &&
    !(file.type === 'application/vnd.ms-excel' || file.type === 'text/csv')
  ) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('Please enter CSV file!');
  }

  if (!window.FileReader || !window.File) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('Does not support File API');
  }

  if (!(file instanceof File)) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('Not a file');
  }

  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onerror = function (err) {
      reject(err);
    };

    // Closure to capture the file information.
    reader.onload = function () {
      const text = reader.result;
      resolve(CSVToArray(text));
    };

    // Read in the image file as a data URL.
    reader.readAsText(file);
  });
};

export const isValidMobile = (number) => {
  const reg = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/; /// ^[0-9]*.{11,11}$/;
  return reg.test(number);
};

export const isValidEmail = (email) => {
  // eslint-disable-next-line no-useless-escape
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
};

export const setCategoryNamesList = (instance, categories) => {
  if (categories) categoryLooping(instance, categories, 0);
};

const categoryLooping = (instance, list, step) => {
  let childStepper = '';

  if (step === 1) childStepper = '-';
  else if (step === 2) childStepper = '--';
  else if (step === 3) childStepper = '---';
  else if (step === 4) childStepper = '----';

  if (list) {
    list.forEach((data) => {
      instance.categoriesList.push({
        text: childStepper + data.name,
        value: data.slug ? data.slug : data.id,
      });
      const childList = data.children;
      if (childList && childList.length > 0)
        categoryLooping(instance, data.children, step + 1);
    });
  }
};

const convertToCSV = (objArray, fieldList) => {
  let str = '';
  objArray.forEach((item) => {
    str += setStringValue(item, fieldList);
    str += '\n';
  });
  return str;
};

const setStringValue = (item, checkList) => {
  let str = '';
  checkList.forEach((field) => {
    str += `${item[field] || ''},`;
  });
  return str;
};

const toggleFullScreen = () => {
  const doc = window.document;
  const docEl = doc.documentElement;

  const requestFullScreen =
    docEl.requestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen ||
    docEl.msRequestFullscreen;
  const cancelFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen;

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
};

const CSVToArray = (strData, strDelimiter) => {
  strDelimiter = strDelimiter || ',';

  const objPattern = new RegExp(
    // Delimiters.
    '(\\' +
      strDelimiter +
      '|\\r?\\n|\\r|^)' +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      '\\r\\n]*))',
    'gi'
  );

  const arrData = [];
  const headers = [];
  let headersFound = false;
  let headerIndex = 0;
  let arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    const strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push({});
      headersFound = true;
      headerIndex = 0;
    }

    let strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    if (arrMatches[2]) {
      // eslint-disable-next-line prefer-regex-literals
      strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    if (!headersFound) {
      headers.push(strMatchedValue);
    } else {
      arrData[arrData.length - 1][headers[headerIndex]] = strMatchedValue;
      headerIndex++;
    }
  }

  // Return the parsed data.
  return arrData;
};

const API_ENDPOINT = {
  BLOG_CATEGORY: 'blog/categories',
  BLOG_CATEGORY_ENTRY: 'blog/categories/entry',
};

export default {
  randomElement,
  toggleFullScreen,
  kebab,
  capitalize,
  slugify,
  uuid,
  humanReadableFileSize,
  API_ENDPOINT,
};

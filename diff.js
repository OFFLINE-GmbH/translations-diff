var fs = require('fs');

// TODO Error Handling if file does not exist
// TODO Error Handling if file is not a JSON

// global variables
var save = false;
var reference_data = null;
var check_index = 0;
var check_data = [];
var check_filenames = [];
var missing_paths = [];

// Helper functions

// Extending arrays by contains
// (https://stackoverflow.com/questions/237104/how-do-i-check-if-an-array-includes-an-object-in-javascript)
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

// Extending strings by replaceAll
// (https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript)
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
* Collects every unique keys of a given object with his full hierarchy
* This function will be called recoursively.
* path: base path of the given current object.
* object: the given object
* keys: a list of already collected keys
*/
collectKeys = function (path,object,keys){
  for (var key in object){
    if (typeof object[key] === 'object'){
      collectKeys(path+"."+key, object[key], keys);
    }
    else{
      // value found
      var current_path = path+"."+key;
      current_path = current_path.substring(1); // remove leading dot
      keys.push(current_path);
    }
  }
}

/**
* checks, if an object has a value other than an object on a given path.
* object: the object to check
* path: the pat to the value, dot separated. eg. path.to.value
* returns: boolean value
*/
containsPath = function(obj, path){
  return getValueByPath(obj,path) != null;
}

/**
* Finds String values in a source array of strings, that are not present in the
* ref array of strings.
* src: an array of strings to look for missing values
* ref: an array of strings as reference
* returns: a list of missing values
*/
compareValues = function(src,ref){
  var result = [];
  ref.forEach(function (val, index, array) {
    if (!src.contains(val)){
      result.push(val);
    }
  });
  return result;
}

/**
* Returns the value of an object field, based on its path of null,
* if the field does not exist or is an object as itself.
* obj: the object containing the fields
* path: the path to the field
* returns: the value of the field or null, if the field does not exist or is an object.
*/
getValueByPath = function(obj, path){
  var parts = path.split('.');
  var o = JSON.parse(JSON.stringify(obj)); // copy object
  parts.forEach(function (val, index, array){
      if (!o.hasOwnProperty(val)){
        return null;
      }
      else {
        o = o[val];
      }
  });
  if (typeof 0 != 'object'){
    return o;
  }
  else{
    return null;
  }
}


// determine reference data and options
if (process.argv.length > 2){
   if (process.argv[2] == "--save"){
     save = true;
     if (process.argv.length > 3){
       reference_data = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
       check_index = 4;
     }
   }
   else{
     if (process.argv.length > 2){
       reference_data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
       check_index = 3;
     }
   }
}

// determine check data
process.argv.forEach(function (val, index, array) {
  if (index>=check_index){
    var check_item = JSON.parse(fs.readFileSync(process.argv[index], 'utf8'));
    check_data.push(check_item);
    check_filenames.push(process.argv[index]);
  }
});

// read reference data
var ref_keys = [];
collectKeys("",reference_data,ref_keys);

// determine missing keys
check_data.forEach(function (val, index, array) {
  var check_keys = [];
  collectKeys("",val,check_keys);
  var missing = compareValues(check_keys,ref_keys);
  missing_paths.push(missing);
});

// print
check_filenames.forEach(function (val, index, array) {
  console.log("missing in "+val+":");
  console.log();
  var current_missing_paths = missing_paths[index];
  current_missing_paths.forEach(function (pVal, pIndex, pArray) {
    console.log("- "+pVal);
  });
  console.log();
});

// save to csv-files
if (save){
  check_filenames.forEach(function (val, index, array){
    var filename = val.split('.')[0]+".missing.csv";
    // TODO more generic filename creation???
    // TODO use csv-writer component
    var current_missing_paths = missing_paths[index];
    var output = "";

    current_missing_paths.forEach(function (pVal, pIndex, pArray) {
      var ref_value = getValueByPath(reference_data,pVal);
      ref_value = ref_value.replaceAll(",","\\,"); // not necessary, when using csv-writer.
      // TODO ^ there are certainly more cases!
      output = output + pVal + "," + ref_value +"\n";
    });

    fs.writeFile(filename, output, function(err) {
        if(err) {
            return console.log(err);
        }
    });
  });
}

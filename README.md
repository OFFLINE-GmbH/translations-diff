# translations-diff

This tool helps you to extract all untranslated strings from json based translation files.

## Usage

Run the script with the master translation file as first parameter. Then pass all other language files as well.

```
$ node diff.js en.json de.json fr.json
```

The script will print out all the missing strings for each language:

```
Missing in de.json:

- login.password
- login.messages.invalid_credentials

Missing in fr.json

- login.username
- login.password
```

### Options

Use the `--save` parameter to write the missing strings to a csv file. A separate file for each language will be created. The file includes the translation key and the original translation string from the master file.

```
$ node diff.js --save en.json de.json fr.json

$ cat de.missing.csv
login.password,Password
login.messages.invalid_credentials,Invalid credentials


$ cat fr.missing.csv
login.messages.invalid_credentials,Invalid credentials
```

## Example translation files

### en.json (Master)

```json
{
    "login": {
        "username": "Username",
        "password": "Password",
        "messages": {
          "invalid_credentials": "Invalid credentials"
        }
    }
}
```

### de.json

```json
{
    "login": {
        "username": "Benutzername"
    }
}
```

### fr.json

```json
{
    "login": {
        "username": "Nom d'utilisateur",
        "password": "Mot de passe",
        "messages": {}
    }
}
```


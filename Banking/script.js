/**
 * @params {String} name
 * @params {String} dob
 * @params {String} gender - "M" for Male, "F" for Female, "O" for Others.
 */
class Person {
  constructor({ name, dob, gender }) {
    if (!name || name.length < 3) {
      console.error("Name should be atleast 3 characters long");
      return;
    }
    if (!dob) {
      console.error("Date of Birth is required");
      return;
    }

    if (!gender) {
      console.error("Please provide your gender");
      return;
    }

    this.id = `${name}_${Date.now()}`;
    this.name = name;
    this.dob = new Date(dob);
    this.gender = gender;
    this.aadhar = null;
    this.pan = null;
    this.isLiked = false;
    this.age = this.getAge();
    this.account = null;
    // this.accounts = [];  // TODO: To store multiple accounts of a person.
  }

  getAge() {
    const today = new Date();
    let age = today.getFullYear() - this.dob.getFullYear();
    const m = today.getMonth() - this.dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.dob.getDate())) {
      age--;
    }
    return age;
  }

  createAadhar() {
    if (!this.aadhar) {
      this.aadhar = new Aadhar({ person: this });
    } else {
      console.warn("Aadhar already exists");
    }
  }

  /**
   *
   * @param {String} type - (P for Individual, F for Firm, C for Company, H for HUF, A for AOP, T for Trust, etc.).
   */
  createPAN(type = "P") {
    if (!this.pan) {
      this.pan = new PAN({ person: this, type });
    } else {
      console.warn("PAN already exists");
      return;
    }
  }

  linkAadharAndPan() {
    if (this.isLiked) {
      console.error("Aadhar and PAN are already linked");
      return;
    }
    if (!this.aadhar || !this.pan) {
      console.error("You need to have both the card before linking.");
      return;
    }
    this.aadhar.pan = this.pan;
    this.pan.aadhar = this.aadhar;
    this.isLiked = true;
  }

  openBankAccount({ pwd, initialDeposit, selectedBank }) {
    const bankName = selectedBank.bankName;
    const newAccount = new Account({
      userName: this.name,
      pwd,
      initialDeposit,
      bankName,
    });
    selectedBank.openAccount(newAccount);
    this.account = newAccount;

    console.log(`
        ********** ACCOUNT CREATED **************
        Your Account [${newAccount.accountNo}] has been created in ${bankName} Bank.
      `);
  }
}

/**
 * @params {Person} person
 */

class Aadhar {
  static aadharNumberDB = new Set();
  static personDB = new Map();

  constructor({ person }) {
    if (!person instanceof Person) {
      console.error("Invalid Person");
      return;
    }
    if (person.aadhar) {
      console.error("Aadhar already exists");
      return;
    }

    this.id = this.#generateID();
    this.name = person.name;
    this.age = person.age;
    this.pan = null;

    Aadhar.personDB.set(this.id, person);
  }

  #generateID() {
    let id;
    do {
      id = "";
      id += Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < 11; i++) {
        id += Math.floor(Math.random() * 9);
      }
    } while (Aadhar.aadharNumberDB.has(id));
    Aadhar.aadharNumberDB.add(id);
    return id;
  }
}

/**
 * @params {Person} person
 * @params {String} type
 */

class PAN {
  static #panNumberDB = new Set();
  static personDB = new Map();

  constructor({ person, type }) {
    // TODO: To check the instance of the person.
    if (!person instanceof Person) {
      console.error("Invalid Person");
      return;
    }
    if (person.pan) {
      console.error("PAN already exists");
      return;
    }

    this.name = person.name;
    this.id = this.#generateID(type);
    this.age = person.age;
    this.aadhar = null;

    PAN.personDB.set(this.id, person);
  }

  #generateID(type) {
    let id;
    do {
      id = "";
      for (let i = 0; i < 3; i++) {
        id += String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
      id += this.name[0].toUpperCase();
      id += type;
      for (let i = 0; i < 4; i++) {
        id += Math.floor(Math.random() * 9);
      }
      id += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } while (PAN.#panNumberDB.has(id));
    PAN.#panNumberDB.add(id);
    return id;
  }
}

const aakash = new Person({
  name: "Aakash Krishna",
  dob: "2000-11-24",
  gender: "M",
});

aakash.createAadhar();
aakash.createPAN();
console.log(aakash);

const sky = new Person({
  name: "Sky",
  dob: "2001-01-01",
  gender: "M",
});

sky.createAadhar();
sky.createPAN("F");

console.log(Aadhar.aadharNumberDB);
console.log(Aadhar.personDB);
console.log(PAN.personDB);

class Account {
  static accountNumberDB = new Set();

  #pwd;
  constructor({ userName, pwd, initialDeposit, bank, ifscCode = null }) {
    if (!userName || userName.length < 3) {
      console.error("Need more characters for your userName");
      return;
    }
    if (!pwd || pwd.length < 3) {
      console.error("Need more characters in pwd");
      return;
    }
    if (isNaN(Number(initialDeposit))) {
      console.error("Need an initial amount to open an Account");
      return;
    }

    this.userName = userName;
    this.#pwd = pwd;
    this.accountNo = `acc_${userName}_${this.generateId()}`;
    this.balance = initialDeposit;
    this.bank = bank;
    this.ifscCode = ifscCode;
  }

  generateId() {
    let id;
    do {
      id = "";
      id += Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < 13; i++) {
        id += Math.floor(Math.random() * 9);
      }
    } while (Account.accountNumberDB.has(id));
    Account.accountNumberDB.add(id);
    return id;
  }

  /**
   *
   * @param {Number} amount
   */
  deposit(amount) {
    const amt = parseInt(amount);
    if (isNaN(amt)) {
      console.error("Amount needs to be an Number");
      return;
    }
    if (amt < 1) {
      console.error("Amount needs to be greater than Zero");
      return;
    }

    this.balance += amt;

    console.warn(`
    [${this.userName}]: amount ${amt} has been credited to your account ${this.accountNo}`);
  }

  /**
   *
   * @param {Number} amount
   */
  withdraw(amount) {
    const amt = parseInt(amount);
    if (isNaN(amt)) {
      console.error("Amount needs to be an Number");
      return;
    }
    if (amt < 1) {
      console.error("Amount needs to be greater than Zero");
      return;
    }
    if (amt > this.balance) {
      console.error("Insufficient balance");
      return;
    }

    this.balance -= amt;

    console.warn(`
    [${this.userName}]: amount ${amt} has been debited from your account ${this.accountNo}`);
  }

  /**
   *
   * @param {Account} to
   * @param {Number} amount
   * @param {String} pwd
   */
  transferTo(to, amount, pwd) {
    if (pwd !== this.#pwd) {
      console.error("Incorrect password");
      return;
    }
    if (!(to instanceof Account)) {
      console.error("Incorrect Account type");
      return;
    }
    this.withdraw(amount);
    to.deposit(amount);
  }

  displayBalance() {
    console.log(`
      ********** BALANCE **************
      Account Number: ${this.accountNo}
      [${this.userName}] your balance is: ${this.balance}
      `);
  }
}

class Bank {
  static banksDB = new Set();
  constructor({ bankName }) {
    if (Bank.banksDB.has(bankName)) {
      console.error("Bank already exists");
    }
    Bank.banksDB.add(bankName);

    this.bankName = bankName;
    this.db = new Map();
  }

  openAccount(account) {
    if (!account instanceof Account) {
      console.error("Incorrect Account type");
      return;
    }
    if (this.db.has(account.accountNo)) {
      console.error("Account already exist");
      return;
    }

    this.db.set(account.accountNo, account);
    return account;
  }

  getAccountById(id) {
    if (!this.db.has(id)) {
      console.error("No account found");
      return;
    }
    return this.db.get(id);
  }
}

// class Bank {
//   constructor(bankName) {
//     this.bankname = bankName;
//     this.db = new Map();
//   }

//   openAccount(account) {
//     if (!(account instanceof Account))
//       console.error("Incorrect Account type");
//     if (this.db.has(account.accountNo))
//       console.error("Account already exist");

//     this.db.set(account.accountNo, account);
//     return account;
//   }

//   getAccountById(id) {
//     if (!this.db.has(id)) console.error("No account found");
//     return this.db.get(id);
//   }
// }

// class Account {
//   #pwd;
//   constructor({ userName, pwd, initialDeposit }) {
//     if (!userName || userName.length < 3)
//       console.error("Need more characters for your userName");
//     if (!pwd || pwd.length < 3) console.error("Need more characters in pwd");
//     if (isNaN(Number(initialDeposit)))
//       console.error("Need a an initial amount to open an Account");

//     this.userName = userName;
//     this.#pwd = pwd;
//     this.accountNo = `acc_${userName}_${Date.now()}`;
//     this.balance = initialDeposit;
//   }

//   deposit(amount) {
//     const amt = Number(amount);
//     if (isNaN(amt)) console.error("Amount needs to be an Number");
//     if (amt < 0) console.error("Amount needs to be greater than Zero");

//     this.balance += amt;

//     console.log(
//       `[${this.userName}] OTP: amount ${amt} has been credited to your account ${this.accountNo}`
//     );
//   }

//   withdraw(amount) {
//     const amt = Number(amount);
//     if (isNaN(amt)) console.error("Amount needs to be an Number");
//     if (amt < 0) console.error("Amount needs to be greater than Zero");
//     if (amt > this.balance) console.error("Insufficient balance");

//     this.balance -= amt;

//     console.log(
//       `[${this.userName}] OTP: amount ${amt} has been debited from your account ${this.accountNo}`
//     );
//   }

//   /**
//    * @params {Account} to
//    * @params {Number} amount
//    * @params {String} pwd
//    */
//   transfer(to, amount, pwd) {
//     if (pwd !== this.#pwd) console.error("Incorrect password");
//     if (!(to instanceof Account)) console.error("Incorrect Account type");
//     this.withdraw(amount);
//     to.deposit(amount);
//   }

//   displayBalance() {
//     console.log(`   ********** BALANCE **************
//     Account Number: ${this.accountNo}
//     [${this.userName}] your balance is: ${this.balance}`);
//   }
// }

// const hdfc = new Bank("HDFC");
// const axis = new Bank("AXIS");

// const Aakash = hdfc.openAccount(
//   new Account({
//     userName: "Aakash",
//     pwd: "aa123",
//     initialDeposit: 900
//   })
// );

// const Sky = axis.openAccount(
//   new Account({
//     userName: "Sky",
//     pwd: "sky123",
//     initialDeposit: 1500
//   })
// );

// hdfc
//   .getAccountById(Aakash.accountNo)
//   .transfer(axis.getAccountById(Sky.accountNo), 100, "aa123");

// Sky.displayBalance();
// Aakash.displayBalance();

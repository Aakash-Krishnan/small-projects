/**
 * @params {String} name
 * @params {String} dob
 * @params {String} gender
 */
class Person {
  constructor({ name, dob, gender }) {
    this.id = `${name}_${Date.now()}`;
    this.name = name;
    this.dob = new Date(dob);
    this.gender = gender;
    this.aadhar = null;
    this.pan = null;
    this.isLiked = false;
    this.age = this.getAge();
    // this.accounts = [];
  }

  getAge() {
    const today = Date.now();
    const age = today.getFullYear() - this.dob.getFulliYear();
    if (m < 0 || (m === 0 && today.getDate() < this.dob.getDate())) {
      age--;
    }
    return age;
  }

  createAadhar() {
    if (!this.aadhar) {
      this.aadhar = new Aadhar({ person: this });
    }
  }

  /**
   *
   * @param {String} type
   */
  createPAN(type = "P") {
    if (!this.pan) {
      this.pan = new PAN({ person: this, type });
    }
  }

  linkAadharAndPan() {
    if (this.isLiked) throw new Error("Aadhar and PAN are already linked");
    if (!this.aadhar || !this.pan) {
      throw new Error("You need to have both the card before linking.");
    }
    this.aadhar.pan = this.pan;
    this.pan.aadhar = this.aadhar;
    this.isLiked = true;
  }
}

/**
 * @params {Person} person
 */

class Aadhar {
  static #aadharNumberDB = new Set();
  static #personDB = new Map();

  constructor({ person }) {
    if (!person instanceof Person) throw new Error("Invalid Person");
    if (person.aadhar) throw new Error("Aadhar already exists");

    this.id = this.#generateID();
    this.name = person.name;
    this.age = person.age;
    this.pan = null;

    Aadhar.#personDB.set(this.id, person);
  }

  #generateID() {
    let id;
    do {
      id = "";
      id += Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < 11; i++) {
        id += Math.floor(Math.random() * 9);
      }
    } while (Aadhar.#aadharNumberDB.has(id));
    console.log(Aadhar.#aadharNumberDB);
    Aadhar.#aadharNumberDB.add(id);
    return id;
  }
}

/**
 * @params {Person} person
 * @params {String} type
 */

class PAN {
  static #panNumberDB = new Set();
  static #personDB = new Map();

  constructor({ person, type }) {
    // TODO: To check the instance of the person.
    if (!person instanceof Person) throw new Error("Invalid Person");
    if (person.pan) throw new Error("PAN already exists");

    this.name = person.name;
    this.id = this.#generateID(type);
    this.age = person.age;
    this.aadhar = null;

    PAN.#personDB.set(this.id, person);
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

// console.log("hello");

// class Account {
//   #pwd;
//   constructor({ userName, pwd, initialDeposit }) {
//     if (!userName || userName.length < 3)
//       throw new Error("Need more characters for your userName");
//     if (!pwd || pwd.length < 3) throw new Error("Need more characters in pwd");
//     if (isNaN(Number(initialDeposit)))
//       throw new Error("Need a an initial amount to open an Account");

//     this.userName = userName;
//     this.#pwd = pwd;
//     this.accountNo = `acc_${userName}_${Date.now()}`;
//     this.balance = initialDeposit;
//   }

//   deposit(amount) {
//     const amt = Number(amount);
//     if (isNaN(amt)) throw new Error("Amount needs to be an Number");
//     if (amt < 0) throw new Error("Amount needs to be greater than Zero");

//     this.balance += amt;

//     console.log(
//       `[${this.userName}] OTP: amount ${amt} has been credited to your account ${this.accountNo}`
//     );
//   }

//   withdraw(amount) {
//     const amt = Number(amount);
//     if (isNaN(amt)) throw new Error("Amount needs to be an Number");
//     if (amt < 0) throw new Error("Amount needs to be greater than Zero");
//     if (amt > this.balance) throw new Error("Insufficient balance");

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
//     if (pwd !== this.#pwd) throw new Error("Incorrect password");
//     if (!(to instanceof Account)) throw new Error("Incorrect Account type");
//     this.withdraw(amount);
//     to.deposit(amount);
//   }

//   displayBalance() {
//     console.log(`   ********** BALANCE **************
//     Account Number: ${this.accountNo}
//     [${this.userName}] your balance is: ${this.balance}`);
//   }
// }

// class Bank {
//   constructor(bankName) {
//     this.bankname = bankName;
//     this.db = new Map();
//   }

//   openAccount(account) {
//     if (!(account instanceof Account))
//       throw new Error("Incorrect Account type");
//     if (this.db.has(account.accountNo))
//       throw new Error("Account already exist");

//     this.db.set(account.accountNo, account);
//     return account;
//   }

//   getAccountById(id) {
//     if (!this.db.has(id)) throw new Error("No account found");
//     return this.db.get(id);
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

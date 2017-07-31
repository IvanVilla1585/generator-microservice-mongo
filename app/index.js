'use strict';

const Generator = require('yeoman-generator');
const kebabcase = require('lodash.kebabcase');
const superb = require('superb');

module.exports = class extends Generator {
	constructor(a, b) {
		super(a, b);
	}

	prompting() {
		return this.prompt([
			{
				name: 'appName',
				message: 'What do you want to name your microservice (singular)?',
				default: kebabcase(this.appname)
			},
			{
				name: 'description',
				message: 'What is your app description?',
				default: `My ${superb()} microservice`
			},
			{
				name: 'username',
				message: 'What is your GitHub username?',
				store: true,
				validate: username => username.length > 0 ? true : 'You have to provide a username'
			},
		]).then(props => {
			const appName = kebabcase(props.appName);
      const appNameCapitalize =  appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();
      const appNameUpperCase =  appName.toUpperCase();

			this.props = Object.assign({
				name: this.user.git.name(),
				email: this.user.git.email(),
			}, props, { appName, appNameCapitalize, appNameUpperCase });
		});
	}

	writing() {
		const mv = (from, to) => {
			this.fs.move(this.destinationPath(from), this.destinationPath(to));
		};

		this.fs.copyTpl([
			`${this.templatePath()}/**/**/**`,
		], this.destinationPath(), this.props);

    // root files
    mv('editorconfig', '.editorconfig');
    mv('gitignore', '.gitignore');
    mv('travis.yml', '.travis.yml');
    mv('dockerignore', '.dockerignore');
    mv('_package.json', 'package.json');
    
    // src files
    mv('config.js', 'src/config.js');
    mv('index.js', 'src/index.js');
    mv('test.js', 'src/test.js');

    // lib files
    mv('db.js', 'src/lib/db.js');
    mv('utils.js', 'src/lib/utils.js');
    mv('validator.js', 'src/lib/validator.js');

	}

	install() {
		this.installDependencies({bower: false});
	}
};

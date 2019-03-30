#! /usr/bin/env node
/**
 * Editor prompt example
 */

"use strict";
var inquirer = require("inquirer");
var tooFile = require("../too.json");
var client = require('scp2')

// TODO: Utilizar pacote abaixo para validação da versão de publicação do pacote.
// https://www.npmjs.com/package/semver

//console.log("tooFile.deploymentEnvironment", tooFile.deploymentEnvironment)
const listaDeAmbientesPublicacao = tooFile.deploymentEnvironment.map(x => {
  return {
    name: x.name
  };
});





const buildChoiceFor = function(params) {
  return [new inquirer.Separator(" = Ambiente de publicação = ")].concat(
    listaDeAmbientesPublicacao
  );
};

console.log("listaDeAmbientesPublicacao", buildChoiceFor());

const util = require("util");
const exec = util.promisify(require("child_process").exec);




// --tag=<name>. Publica sob o npm dist-tag especificado.
//https://docs.npmjs.com/cli/dist-tag
async function changePackageVersion(args) {
  let packageStrComand = "npm version patch";


  switch (args.semanticVersion[0]) {
  
    //TODO: Da suporte a mais cases
    //https://github.com/angular/angular-cli/blob/a355e7d693a8a74b2010e18f67cfd86207a9eac7/scripts/release.ts#L123
    // case 'major-beta':
    // case 'major-rc':
    // case 'minor-beta':
    // case 'minor-rc':
    // case 'major':
    // case 'minor':
    // case 'patch':
  
  
    case "MAJOR":
      packageStrComand = "npm version major";
      break;
    case "MINOR":
      packageStrComand = "npm version minor";
      break;
    case "PATCH":
      packageStrComand = "npm version patch";
      break;

    default:
      throw new Error("Versão não esperada!");
      break;
  }
  const { stdout, stderr } = await exec(packageStrComand);
  console.log("Nova versão:", stdout);
  // console.log("stderr:", stderr);
}

async function buildAngularApplication(args) {
  const packageStrComand = tooFile.deploymentEnvironment.find(
    x => x.name === args.deploymentEnvironment[0]
  );

  const { stdout, stderr } = await exec(packageStrComand);

  console.log("Nova versão:", stdout);
  // console.log("stderr:", stderr);
}

inquirer
  .prompt([
    {
      type: "checkbox",
      message: "Qual o nivel de alteracão?",
      name: "semanticVersion",
      choices: [
        new inquirer.Separator(" = semantic version = "),
        {
          name: "MAJOR"
        },
        {
          name: "MINOR"
        },
        {
          name: "PATCH"
        }
      ],
      validate: function(answer) {
        if (answer.length < 1) {
          return "You must choose at least one topping.";
        }

        return true;
      }
    },

    {
      type: "checkbox",
      message: "Qual é o ambiente de publicação?",
      name: "deploymentEnvironment",
      choices: buildChoiceFor(),
      validate: function(answer) {
        if (answer.length < 1) {
          return "You must choose at least one topping.";
        }

        return true;
      }
    },

    {
      type: "confirm",
      message: "Confirma o caminho de publicaco?",
      name: "deploymentFolder"
    }
  ])
  .then(answers => {
    const resp = JSON.stringify(answers, null, "  ");
    changePackageVersion(answers);

    moveREmote(answers)

    
  });


  const moveREmote = function (args) {
    
    const packageStrComand = tooFile.deploymentEnvironment.find(
      x => x.name === args.deploymentEnvironment[0]
    );

    console.log("env", packageStrComand);
    

    client.scp('src/*.js', packageStrComand.path, function(err) {
      console.log("client.scp >> err", err)
    });
  }
'use strict';

var $ = require('jquery');
var eventablejs = require('eventablejs');
var _   = require('../lodash.js');
var xhr         = require('etudiant-mod-xhr');

var copyrightTemplate =  '<figcaption><input class="copyright" list="copyrights" type="text" placeholder="Copyright"><button class="validate">Ok</button>'

function prepareCopyrights(copyrights) {
    return copyrights.map(function(copyright) {
        return {
            value: copyright.id,
            label: copyright.name
        };
    });
}
function appendCopyrightSelector(block) {
    block.$el.find('figure').append(copyrightTemplate);
    bindEventToCopyright(block);
}

function bindEventToCopyright(block) {

    var $validate = block.$el.find('figure figcaption .validate');

    $validate.on('click', function(ev){
        ev.preventDefault();

        var url = block.globalConfig.apiUrl + 'edt/media/' + block.imageId;
        var saveData = {};

        saveData['copyright'] = block.$el.find('figure figcaption .copyright').val();
        saveData['id_categorie'] = 2;
        saveData['legende'] = block.$el.find('figure figcaption .copyright').val();

        xhr.patch(url, saveData)
            .then(function(returnedData) {
               console.log('Block informations updated');
            })
            .catch(function(err) {
                console.error('Error updating copyright informations', err);
            });
    })
}

var CopyrightPicker = function(block) {
    appendCopyrightSelector(block);
    this.init(block);

};

var prototype = {
    init: function(block) {
        var self = this;
        var categoryOptionsUrl = block.globalConfig.apiUrl + 'edt/media/filters/' + block.globalConfig.application;

        var categoryOptionsPromise = xhr.get(categoryOptionsUrl)
            .then(function(result) {
                var copyrights = prepareCopyrights(result.content.copyrights);
                var optionsHtml = '<datalist id="copyrights">';
                Object.keys(copyrights).forEach(function(key){
                    var optionTpl = _.template('<option value="<%= value %>">');
                    optionsHtml =  optionsHtml + optionTpl({
                        'value': copyrights[key].label
                    });
                });
                optionsHtml = optionsHtml + '</datalist>'
                var $figcaption = block.$el.find('figure figcaption');
                $figcaption.append(optionsHtml);

            })
            .catch(function(err) {
                console.error(err);
            });
        }
};

CopyrightPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = CopyrightPicker;

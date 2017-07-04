(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.VDatalist = factory()
}(this, function() {
    function VDatalist(args) {
        if (args) {
            this.create(args);
        }
    }

    VDatalist.prototype.create = function(args) {
        var _tpl = '<input type="text"v-model="textSelected"list="{{id}}"><datalist id="{{id}}"><option v-for="option in options">{{option}}</option></datalist>';
        var _id = Math.floor(Math.random()*(99999-10000)+10000);

        var DatalistComponent = Vue.extend({
            template: _tpl,
            props: ['valueSelected', 'options'],
            data: function() {
                return { id: _id };
            },
            computed: {
                textSelected: {
                    get: function() {
                        return this.options[this.valueSelected];
                    },
                    set: function(val) {
                        for (var i in this.options) {
                            if (this.options[i] == val) {
                                this.$set('valueSelected', i);
                                break;
                            }
                        }
                    }
                }
            }
        });

        Vue.component(args.component, DatalistComponent);
    };

    return VDatalist;
}));
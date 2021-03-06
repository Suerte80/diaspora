// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-v3-or-Later

//= require jquery.autoSuggest.custom
app.views.TagFollowingList = app.views.Base.extend({

  templateName: "tag_following_list",

  className : "sub_nav",

  id : "tags_list",

  tagName : "ul",

  events: {
    "submit form": "createTagFollowing"
  },

  initialize : function(){
    this.collection.on("add", this.appendTagFollowing, this);
    this.collection.on("reset", this.postRenderTemplate, this);
  },

  postRenderTemplate : function() {
    // add the whole sorted collection without handling each item separately
    this.collection.each(function(tag) {
      this.$el.prepend(new app.views.TagFollowing({
        model: tag
      }).render().el);
    }, this);
  },

  setupAutoSuggest : function() {
    this.$("input").autoSuggest("/tags", {
      selectedItemProp: "name",
      selectedValuesProp: "name",
      searchObjProps: "name",
      asHtmlID: "tags",
      neverSubmit: true,
      retrieveLimit: 10,
      selectionLimit: false,
      minChars: 2,
      keyDelay: 200,
      startText: "",
      emptyText: "no_results",
      selectionAdded: _.bind(this.suggestSelection, this)
    });

    this.$("input").bind('keydown', function(evt){
      if(evt.which === Keycodes.ENTER || evt.which === Keycodes.TAB || evt.which === Keycodes.SPACE) {
        evt.preventDefault();
        if( $('li.as-result-item.active').length === 0 ){
          $('li.as-result-item').first().click();
        }
      }
    });
  },

  presenter : function() {
    return this.defaultPresenter();
  },

  suggestSelection : function(elem) {
    this.$(".tag_input").val($(elem[0]).text().substring(2));
    elem.remove();
    this.createTagFollowing();
  },

  createTagFollowing: function(evt) {
    if(evt){ evt.preventDefault(); }

    var name = this.$(".tag_input").val();
    // compare tag_text_regexp in app/models/acts_as_taggable_on-tag.rb
    var normalizedName = (name === "<3" ? name : name.replace(
        new RegExp("[^" + PosixBracketExpressions.alnum + "_\\-]+", "gi"), "").toLowerCase());

    this.collection.create({"name":normalizedName});

    this.$(".tag_input").val("");
    return this;
  },

  appendTagFollowing: function(tag) {
    // insert new tag in the order of the collection
    var modelIndex = this.collection.indexOf(tag);
    var prevModel = this.collection.at(modelIndex + 1); // prev in alphabet, +1 (next) in reverse sorted list

    if (prevModel) {
      var prevModelDom = this.$("#tag-following-" + prevModel.get("name"));
      if (prevModelDom.length > 0) {
        prevModelDom.after(new app.views.TagFollowing({
          model: tag
        }).render().el);
        return;
      }
    }

    // we have no previous Model and no View, so just prepend to the list
    this.$el.prepend(new app.views.TagFollowing({
      model: tag
    }).render().el);
  },

  hideFollowedTags: function() {
    this.$el.empty();
  },
});
// @license-end

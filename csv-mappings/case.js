function asTextOrNull(fragment) {
  if(fragment && fragment.asText) {
    return fragment.asText();
  } else {
    return null;
  }
}

module.exports = {
  title: doc => asTextOrNull(doc.getStructuredText('case.title')),
  short_description: doc => asTextOrNull(doc.getStructuredText('case.short_description')),
  description: doc => asTextOrNull(doc.getStructuredText('case.description')),
  image: doc => {
    const pictures = doc.getGroup('case.pictures').toArray();
    if(pictures.length > 0) {
      const firstPicture = pictures[0];
      return firstPicture.getImage('picture').url;
    } else {
      return null;
    }
  }
};

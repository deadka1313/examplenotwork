function endWithType(fileType) {
  return function(parsed) {
    return parsed.moduleName.endsWith(`.${fileType}`);
  };
}

function startsWith(...prefixes) {
  return parsed => {
    return prefixes.some(prefix => parsed.moduleName.startsWith(prefix));
  };
}

module.exports.default = function(styleApi) {
  const {
    and,
    alias,
    hasNoMember,
    isAbsoluteModule,
    isRelativeModule,
    isInstalledModule,
    isNodeModule,
    moduleName,
    not,
    dotSegmentCount,
    unicode,
    naturally,
  } = styleApi;

  return [
    // import "foo"
    { match: and(hasNoMember, isAbsoluteModule) },
    { separator: true },

    // import "./foo"
    { match: and(hasNoMember, isRelativeModule) },
    { separator: true },

    // import … from "fs";
    {
      match: isNodeModule,
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },

    { separator: true },

    // import … from "react *";
    {
      match: and(isInstalledModule('node_modules'), startsWith('react')),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },

    // import … from "library";
    {
      match: isInstalledModule('node_modules'),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "types/*";
    {
      match: and(isAbsoluteModule, startsWith('types')),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },
    // import … from "helpers/*";
    // import … from "utils/*";
    // import … from "services/*";
    // import … from "selectors/*";
    {
      match: and(isAbsoluteModule, startsWith('helpers', 'utils', 'services', 'selectors')),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "models/*";
    {
      match: and(isAbsoluteModule, startsWith('models')),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "core/*";
    {
      match: and(isAbsoluteModule, startsWith('core')),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "ui/*";
    // import … from "component/*";
    {
      match: and(isAbsoluteModule, startsWith('ui', 'components')),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "foo";
    {
      match: and(isAbsoluteModule),
      sort: moduleName(naturally),
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "./foo";
    // import … from "../foo";
    {
      match: and(isRelativeModule, not(endWithType('less'))),
      sort: [dotSegmentCount, moduleName(naturally)],
      sortNamedMembers: alias(unicode),
    },
    { separator: true },

    // import … from "./style.less";
    {
      match: and(isRelativeModule, endWithType('less')),
      sort: [dotSegmentCount, moduleName(naturally)],
      sortNamedMembers: alias(unicode),
    },
    { separator: true },
  ];
};

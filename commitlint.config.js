const HEADER_PATTERN = /^\[#\d+\](add|update|fix|refactor|docs): .+$/;

export default {
  plugins: [
    {
      rules: {
        'family-tree-header': ({ header }) => {
          if (HEADER_PATTERN.test(header)) {
            return [true];
          }
          return [
            false,
            'コミットメッセージは "[#<issue>]<type>: <説明>" 形式にしてください (type は add / update / fix / refactor / docs のいずれか)',
          ];
        },
      },
    },
  ],
  rules: {
    'family-tree-header': [2, 'always'],
  },
};

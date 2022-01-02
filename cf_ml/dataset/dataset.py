import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler


class Dataset:
    """A class to store and process datasets in pd.DataFrame.

    Args: 
        name: str, the name of the dataset, e.g. diabetes, german-credit.
        dataframe: pandas.DataFrame, raw dataset in the form of pandas.DataFrame
        description: dict, key: column name, value: {'type': 'numerical'|'categorical', 
            'min': number (optional), 'max': number (optional), 
            'decile': precision in number (optional), 
            'category': list of categories (optional)}.
        target_name: str, the name of the target attribute.
        split_rate: number, the ratio between the training dataset size and the whole dataset 
    """

    def __init__(self, name, dataframe, description, target_name, split_rate=0.8):
        self._name = name
        self._data = dataframe
        self._columns = [col for col in self._data.columns if col in description]
        self._description = self._check_and_clean_description(description)
        self._target = target_name

        self._dummy_columns = self._get_all_columns(self._columns)

        self._features = list(filter(lambda x: x != self.target, self.columns))
        self._numerical_features = list(filter(self.is_num, self._features))
        self._categorical_features = list(filter(lambda x: not self.is_num(x), self._features))

        self._check_dataframe()

        self._feature_scalar = MinMaxScaler()
        self._fit_normalizer()
        self._fit_one_hot_encoder()

        train_df, test_df = train_test_split(
            self._data, train_size=split_rate, random_state=0)

        self._train_X = train_df[self.features]
        self._train_y = train_df[self.target]
        self._test_X = test_df[self.features]
        self._test_y = test_df[self.target]

    def _check_and_clean_description(self, description):
        """Check and fill the descriptions to the dataset."""
        clean_description = {col: {'index': self.columns.index(col), 'type': info['type']} 
			for col, info in description.items()}
        # check whether each column is noted as numerical or categorical
        for col, info in clean_description.items():
            if info['type'] not in ['numerical', 'categorical']:
                raise ValueError(
                    "Illegal description of attribute: {}".format(col))

        for col, info in description.items():
            # complete min, max, and decile for numerical attributes
            if info['type'] == 'numerical':
                clean_description[col]['min'] = info.get('min', float(self.data[col].min()))
                clean_description[col]['max'] = info.get('max', float(self.data[col].max()))
                decile = int(info.get('decile', 0))
                clean_description[col]['decile'] = decile
                clean_description[col]['scale'] = 1 if decile == 0 else 0.1 ** decile
            # complete categories for categorical attributes
            else:
                clean_description[col]['categories'] = info.get('category',
                                                                self._data[col].unique().tolist())

        return clean_description

    def _check_dataframe(self):
        """Check the stringify the categorical data in the dataframe."""
        for col in self.columns:
            if not self.is_num(col):
                self._data[col] = self._data[col].apply(lambda x: str(x))
                self._description[col]['categories'] = [str(cat) for cat in
                                                        self._description[col]['categories']]

    def is_num(self, column_name):
        """Check whether the type of the column is numerical."""
        return self.description[column_name]['type'] == 'numerical'

    def get_dummy_columns(self, column, categories=None):
        """Get the names of the dummy columns from the original column name and categories."""
        if self.is_num(column):
            return [column]
        if categories is None:
            categories = self.description[column]['categories']
        return ["{}_{}".format(column, cat) for cat in categories]

    def _get_all_columns(self, columns):
        dummy_columns = []
        for col in columns:
            dummy_columns.extend(self.get_dummy_columns(col))
        return dummy_columns

    def _fit_normalizer(self):
        self._feature_scalar.fit(self._data[self.numerical_features])

    def _fit_one_hot_encoder(self):
        pass

    def _normalize(self, data):
        data = data.copy()
        data[self.numerical_features] = self._feature_scalar.transform(
            data[self.numerical_features])
        return d
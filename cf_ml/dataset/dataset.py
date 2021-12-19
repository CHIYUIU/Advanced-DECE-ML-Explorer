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
            self._data, train_size=split_rate, rand